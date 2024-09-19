"use client";
import { useEffect, useState } from "react";
import crypto from "crypto";
import { useZxing } from "react-zxing";
import Popup from "@/components/popup/Popup";

const page = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [pStyle, setPStyle] = useState<"success" | "fail">("success");
  const [msg, setMsg] = useState("");
  const ENCRYPTION_KEY = Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string, "hex");
  const IV = Buffer.from(process.env.NEXT_PUBLIC_IV as string, "hex");
  const [result, setResult] = useState("");
  // in order to parse the data using JSON.parse and use properties such as eventId, userEmail, and so on
  const [parsedResult, setParsedResult] = useState<any>(null);

  // decryption function
  const decrypt = (encryptedText: string) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY as any, IV as any);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };
  // handlescan
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(decrypt(result.getText()));
    },
  });

  useEffect(() => {
    if (result) {
      try {
        // parsing the data event object from result (qr code)
        const parsedData = JSON.parse(result);
        setParsedResult(parsedData);
        updateAttendace(parsedData);
      } catch (error) {
        console.error("Failed to parse result:", error);
      }
    }
  }, [result]);

  const updateAttendace = async (data: any) => {
    if (!data || !data.eventId) {
      console.error("Invalid data or missing eventId");
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
        // console.log(responseData);
        // console.log(responseData.msg);
        // alert(responseData.msg);
        setMsg(responseData.msg);
        setShowPopup(true);
        setPStyle("success");
      } else {
        // console.error("Failed to send data");
        // alert(responseData.msg);
        setMsg(responseData.msg);
        setShowPopup(true);
        setPStyle("fail");
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="sm:py-4 sm:pl-14">
      <video ref={ref} className="w-full h-screen" />
      {/* <p>
        <span>Last result:</span>
        <span>{result}</span>
      </p>
      <button onClick={() => console.log(result)}>CLICK TO log parsed result</button>
      {parsedResult && (
        <div>
          <h2>Parsed Result:</h2>
          <pre>{JSON.stringify(parsedResult, null, 2)}</pre>
        </div>
      )} */}
      {showPopup && <Popup message={msg} onClose={() => setShowPopup(false)} style={pStyle} />}
    </div>
  );
};

export default page;
