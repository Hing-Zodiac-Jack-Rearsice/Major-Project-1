import React from "react";

interface ReceiptProps {
  eventId: string;
  ticketPrice: number;
  quantity: number;
  paymentMethod: string;
  paymentDate: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
}

const Receipt: React.FC<ReceiptProps> = ({
  eventId,
  ticketPrice,
  quantity,
  paymentMethod,
  paymentDate,
  orderId,
  buyerName,
  buyerEmail,
}) => {
  return (
    <div>
      <h1>Receipt</h1>
      <p>Event: {eventId}</p>
      <p>Ticket Price: ${ticketPrice}</p>
      <p>Quantity: {quantity}</p>
      <p>Payment Method: {paymentMethod}</p>
      <p>Payment Date: {paymentDate}</p>
      <p>Order ID: {orderId}</p>
      <p>
        Buyer: {buyerName} ({buyerEmail})
      </p>
    </div>
  );
};

export default Receipt;
