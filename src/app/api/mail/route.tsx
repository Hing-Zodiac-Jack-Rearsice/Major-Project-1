import { transporter } from "@/lib/nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: body.email,
      subject: body.subject,
      text: body.text,
      html: `<div>
         <div style="text-align: center;">
            <img src="${body.qrUrl}" alt="QR Code" style="display: block; margin: 0 auto;" />
          </div>
          <p>${body.text}</p>
        </div>`,
    });
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.log(error, "error sending email");
    return new NextResponse(JSON.stringify({ error: error }), { status: 500 });
  }
}
