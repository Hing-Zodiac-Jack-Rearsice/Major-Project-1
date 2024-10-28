"use client";
import { useEffect, useState } from "react";
import crypto from "crypto";
import { useZxing } from "react-zxing";
import Popup from "@/components/popup/Popup";

const Page = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [pStyle, setPStyle] = useState<"success" | "fail">("success");
  const [msg, setMsg] = useState("");
  const ENCRYPTION_KEY = Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string, "hex");
  const IV = Buffer.from(process.env.NEXT_PUBLIC_IV as string, "hex");
  const [result, setResult] = useState("");
  const [parsedResult, setParsedResult] = useState<any>(null);

  // Decryption function
  const decrypt = (encryptedText: string) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY as any, IV as any);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  // QR code scan handler
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(decrypt(result.getText()));
    },
  });

  useEffect(() => {
    if (result) {
      try {
        const parsedData = JSON.parse(result);
        setParsedResult(parsedData);
        updateAttendance(parsedData);
      } catch (error) {
        setMsg("Error: Invalid QR Code format.");
        setPStyle("fail");
        setShowPopup(true);
        console.error("Failed to parse result:", error);
      }
    }
  }, [result]);

  const updateAttendance = async (data: any) => {
    if (!data || !data.eventId) {
      setMsg("Error: Missing event ID.");
      setPStyle("fail");
      setShowPopup(true);
      return;
    }

    try {
      const res = await fetch(`/api/attendance/events/${data.eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: data.userEmail,
          eventName: data.eventName,
          eventId: data.eventId,
        }),
      });

      const responseData = await res.json();

      if (res.status === 200) {
        setMsg(responseData.msg);
        setPStyle("success");
      } else {
        setMsg(responseData.msg);
        setPStyle("fail");
      }
      setShowPopup(true);
    } catch (error) {
      setMsg("Error sending data.");
      setPStyle("fail");
      setShowPopup(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-3xl w-full rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">QR Code Scanner</h1>
        <p className="text-center mb-4">
          Scan your event&apos;s QR code to register your attendance.
        </p>

        {/* Larger camera view */}
        <div className="relative w-full h-[75vh] rounded-lg overflow-hidden mb-4">
          <video ref={ref} className="w-full h-full object-cover" />
        </div>

        {/* <div className="text-center">
          {parsedResult && (
            <div>
              <h2 className="text-lg font-semibold">Scan Successful</h2>
              <p>Event: {parsedResult.eventName}</p>
              <p>User: {parsedResult.userEmail}</p>
            </div>
          )}
        </div> */}
      </div>

      {/* Popup Component for feedback */}
      {showPopup && <Popup message={msg} onClose={() => setShowPopup(false)} style={pStyle} />}
    </div>
  );
};

export default Page;
