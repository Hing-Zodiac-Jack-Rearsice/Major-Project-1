// src/lib/email.ts
import { transporter } from "@/lib/nodemailer";

export async function sendEmail(to: string, subject: string, body: string, attachments?: { filename: string, content: string, encoding: string }[]) {
    try {
        const mailOptions = {
            from: "your-email@example.com",
            to,
            subject,
            text: body,
            attachments: attachments || [],
        };

        if (attachments) {
            mailOptions.attachments = attachments;
        }

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}