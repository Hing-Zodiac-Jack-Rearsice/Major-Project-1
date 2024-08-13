"use client";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "@/lib/firebase";

const page = () => {
  const { data: session } = useSession();
  const [event, setEvent] = useState<any>(null);
  //   const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { id } = useParams();
  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/events/${id}`);
      const data = await res.json();
      //   console.log(data.event);
      setEvent(data.event);
    };
    fetchEvent();
  }, []);
  const handleTicket = async () => {
    const qrUri = await QRCode.toDataURL(
      JSON.stringify({
        eventId: event.id,
        eventName: event.eventName,
        userEmail: session?.user.email,
      })
    );
    const qrBuffer = Buffer.from(qrUri.split(",")[1], "base64");
    const qrUrl = await uploadQr(qrBuffer);
    const res = await fetch("/api/events/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId: event.id,
        eventName: event.eventName,
        userEmail: session?.user.email,
        qrCodeUrl: qrUrl,
      }),
    });
    if (res.ok) {
      await sendMail(qrUrl);
      alert("Ticket created successfully");
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
      email: session?.user.email,
      subject: "qrcode",
      text: "Testing some Mailgun awesomness!",
      qrUrl: qrUrl,
    };
    const res = await fetch(`/api/mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailData),
    });
    if (res.ok) {
      alert("Mail sent successfully");
    }
  };

  if (!event) return <div className="pl-14">Loading...</div>;
  // Create a Date object from the event.date string
  const eventDate = new Date(event.date);

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
  return session?.user.role === "admin" ? (
    event && (
      <div className="sm:pl-14">
        <img src={event.imageUrl} alt="" className="w-full h-96 object-cover" />
        <div className="px-6">
          <div>
            {/* this can be used for events details on client side*/}
            {/* <h1 className="text-2xl">Event details</h1> */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold my-4 sm:text-4xl">{event.eventName}</h1>
              <div className="items-center gap-2 sm:flex">
                <p className="underline-offset-4 bg-yellow-300 p-2 rounded-sm dark:text-black font-bold text-nowrap">
                  ON CLIENT SIDE
                </p>
                <Button className="font-bold">Update</Button>
              </div>
            </div>
            <div className="gap-10 items-center sm:flex">
              <div className="my-2 sm:my-0">
                <h1 className="text-xl font-semibold">Date and Time</h1>
                <p>
                  {formattedDate} - {formattedTime}
                </p>
              </div>
              <div className="my-2 sm:my-0">
                <h1 className="text-xl font-semibold">Location</h1>
                <p>{event.location}</p>
              </div>
              <Button variant="outline" className="w-full sm:w-fit">
                $ {event.ticketPrice}
              </Button>
            </div>
            <div className="my-4">
              <h1 className="text-xl font-semibold">Event Description</h1>
              <p>{event.description}</p>
            </div>
          </div>
          <h1 className="text-2xl">Attendees</h1>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-accent">
                <TableCell>
                  <div className="font-medium">Liam Johnson</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Sale</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Olivia Smith</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    olivia@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Refund</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Declined
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-24</TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Noah Williams</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    noah@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Subscription</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-25</TableCell>
                <TableCell className="text-right">$350.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Emma Brown</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    emma@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Sale</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-26</TableCell>
                <TableCell className="text-right">$450.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Liam Johnson</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Sale</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Liam Johnson</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    liam@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Sale</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-23</TableCell>
                <TableCell className="text-right">$250.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Olivia Smith</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    olivia@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Refund</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="outline">
                    Declined
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-24</TableCell>
                <TableCell className="text-right">$150.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="font-medium">Emma Brown</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    emma@example.com
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">Sale</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant="secondary">
                    Fulfilled
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">2023-06-26</TableCell>
                <TableCell className="text-right">$450.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <h1 className="text-2xl">Analytics</h1>
        </div>
      </div>
    )
  ) : (
    <div className="">
      <img src={event.imageUrl} alt="" className="w-full h-96 object-cover" />
      <div className="px-6">
        <div>
          {/* this can be used for events details on client side*/}
          {/* <h1 className="text-2xl">Event details</h1> */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold my-4 sm:text-4xl">{event.eventName}</h1>
            <div className="items-center gap-2 sm:flex">
              <p className="underline-offset-4 bg-yellow-300 p-2 rounded-sm dark:text-black font-bold text-nowrap">
                working client
              </p>
              <Button className="font-bold">Update</Button>
            </div>
          </div>
          <div className="gap-10 items-center sm:flex">
            <div className="my-2 sm:my-0">
              <h1 className="text-xl font-semibold">Date and Time</h1>
              <p>
                {formattedDate} - {formattedTime}
              </p>
            </div>
            <div className="my-2 sm:my-0">
              <h1 className="text-xl font-semibold">Location</h1>
              <p>{event.location}</p>
            </div>
            <Button variant="outline" className="w-full sm:w-fit" onClick={() => handleTicket()}>
              $ {event.ticketPrice}
            </Button>
          </div>
          <div className="my-4">
            <h1 className="text-xl font-semibold">Event Description</h1>
            <p>{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
