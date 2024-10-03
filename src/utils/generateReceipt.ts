import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

import vfs from "pdfmake/build/vfs_fonts.js";
import Receipt from "@/components/Receipt";

pdfMake.vfs = pdfFonts.pdfMake.vfs; // Ensure you have the correct import for pdfMake

export default async function generateReceipt(
    eventId: string,
    ticketPrice: number,
    quantity: number,
    paymentMethod: string,
    paymentDate: string,
    orderId: string,
    buyerName: string,
    buyerEmail: string
): Promise<any> { // Replace 'any' with the correct type if known
    // Define the receipt content for pdfMake
    const receiptContent = {
        text: [
            `Event ID: ${eventId}\n`,
            `Ticket Price: ${ticketPrice}\n`,
            `Quantity: ${quantity}\n`,
            `Payment Method: ${paymentMethod}\n`,
            `Payment Date: ${paymentDate}\n`,
            `Order ID: ${orderId}\n`,
            `Buyer Name: ${buyerName}\n`,
            `Buyer Email: ${buyerEmail}\n`
        ]
    };

    const docDefinition = {
        content: [receiptContent],
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    return pdfDoc;
};
