import QRCode from "qrcode";

import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "@/lib/firebase";
import { NextResponse } from "next/server";
// encryption module
import crypto from "crypto";
import prisma from "@/lib/db";
import { error } from "console";
// Encryption key and IV (Initialization Vector)
export const ENCRYPTION_KEY = Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string, "hex"); // 256 bits key
export const IV = Buffer.from(process.env.NEXT_PUBLIC_IV as string, "hex"); // 128 bits IV

const encrypt = (text: any) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY as any, IV as any);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // sessions for detecting currently logged in user
  const body = await request.json();
  const emailFromBody = await body.userEmail;
  const userNameFromBody = await body.userName;
  // id params
  if (emailFromBody !== "") {
    const { id } = params;
    // use id params to find unique event
    const res = await fetch(`http://localhost:3000/api/events/${id}`);
    //   if data is received successfully from api run the below methods to generate qr and send the qr ticket to the buyer

    if (res.ok) {
      const data = await res.json();
      const uniqueEvent = data.event;
      // Create a Date object from the event.date string
      const eventDate = new Date(uniqueEvent?.startDate as Date);
      const eventEndDate = new Date(uniqueEvent?.endDate as Date);
      // Format the date
      const formattedDate = eventDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // If you want to separate the time as well, you can do that here
      const formattedTime = eventDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedEndTime = eventEndDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const handleTicket = async () => {
        const existingTicket = await prisma.ticket.findFirst({
          where: {
            eventId: uniqueEvent.id,
            userEmail: emailFromBody,
          },
        });
        if (existingTicket) {
          return NextResponse.json(
            { error: "You have already purchased a ticket for this event." },
            { status: 400 }
          );
        }
        const encryptedData = encrypt(
          JSON.stringify({
            eventId: uniqueEvent?.id,
            eventName: uniqueEvent?.eventName,
            userEmail: emailFromBody,
          })
        );
        const qrUri = await QRCode.toDataURL(
          // encrypt qr code Data
          encryptedData
        );
        const qrBuffer = Buffer.from(qrUri.split(",")[1], "base64");
        const qrUrl = await uploadQr(qrBuffer);
        const res = await fetch("http://localhost:3000/api/events/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId: uniqueEvent?.id,
            eventName: uniqueEvent?.eventName,
            userEmail: emailFromBody,
            qrCodeUrl: qrUrl,
          }),
        });
        if (res.ok) {
          await sendMail(qrUrl);
          await addUserToAttendace();
          // alert("Ticket created & mailed successfully");
        }
      };

      const addUserToAttendace = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/attendance/${id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventId: uniqueEvent?.id,
              userEmail: emailFromBody,
              userName: userNameFromBody,
              eventName: uniqueEvent?.eventName,
            }),
          });
          if (!res.ok) {
            throw new Error("Failed to add user to the list of attendees");
          } else {
            // alert(`Added ${emailFromBody} to the list of attendees`);
          }
        } catch (error) {
          console.log(error, "Failed to add user to the list of attendees");
        }
      };
      const uploadQr = async (qrBuffer: Buffer): Promise<string> => {
        const storage = getStorage(app);
        const metadata = {
          contentType: "image/png",
        };
        const fileName =
          Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const storageRef = ref(storage, "qrCodes/" + fileName + ".png");
        const uploadTask = uploadBytesResumable(storageRef, qrBuffer);

        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
              switch (snapshot.state) {
                case "paused":
                  console.log("Upload is paused");
                  break;
                case "running":
                  console.log("Upload is running");
                  break;
              }
            },
            (error) => {
              switch (error.code) {
                case "storage/unauthorized":
                  reject(new Error("User doesn't have permission to access the object"));
                  break;
                case "storage/canceled":
                  reject(new Error("User canceled the upload"));
                  break;
                case "storage/unknown":
                  reject(new Error("Unknown error occurred, inspect error.serverResponse"));
                  break;
              }
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                // console.log("File available at", downloadURL);
                resolve(downloadURL);
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      };
      //   sending mail test
      const sendMail = async (qrUrl: string) => {
        const mailData = {
          email: emailFromBody,
          subject: `🎫 Your Ticket to ${uniqueEvent?.eventName} is Here!`,
          text: `Hi <b>${userNameFromBody}</b>,
    Your ticket to ${uniqueEvent?.eventName} is attached! We're excited to have you join us.<br>
    Below are the details for the event, along with your unique QR code for entry.<br>
    <br>
    Ticket Details:<br>
    <br>
    Event: ${uniqueEvent?.eventName}<br>
    Date: ${formattedDate}<br>
    Time: ${formattedTime} - ${formattedEndTime}<br>
    Location: ${uniqueEvent?.location}<br>
    <br>
    Important Information:<br>
    <br>
    QR Code: Please present the QR code at the entrance for scanning.<br>
    <br>
    Looking forward to seeing you at ${uniqueEvent?.eventName}!<br>
    <br>
    Best Regards,<br>
    The ${uniqueEvent?.eventName} Team`,
          qrUrl: qrUrl,
        };
        const res = await fetch(`http://localhost:3000/api/mail`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mailData),
        });
        if (res.ok) {
          //   alert("Mail sent successfully");
        }
      };
      // run the handleTicket()
      await handleTicket();
      return NextResponse.json({ success: `mail sent to ${emailFromBody}` }, { status: 200 });
    }
  } else {
    return NextResponse.json({ error: "No user found" }, { status: 401 });
  }
}
