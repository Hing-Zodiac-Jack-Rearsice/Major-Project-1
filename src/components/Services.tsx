import React from "react";

export default function Services() {
  return (
    <div>
      <h1 className="text-3xl font-bold py-4 text-center">Our Focus</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 sm:p-6">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
          <div className="p-6 flex items-center gap-4">
            <div className="bg-primary rounded-md p-3 flex items-center justify-center">
              <LaptopIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Event Creation</h3>
              <p className="text-muted-foreground">Easily create and manage events.</p>
            </div>
          </div>
        </div>
        <div className="bg-background rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
          <div className="p-6 flex items-center gap-4">
            <div className="bg-primary rounded-md p-3 flex items-center justify-center">
              <SmartphoneIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Ticket Sales</h3>
              <p className="text-muted-foreground">
                Sell tickets online with customizable options.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-background rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
          <div className="p-6 flex items-center gap-4">
            <div className="bg-primary rounded-md p-3 flex items-center justify-center">
              <DatabaseIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">QR Code Tickets</h3>
              <p className="text-muted-foreground">Automatic QR code generation and delivery.</p>
            </div>
          </div>
        </div>
        <div className="bg-background rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
          <div className="p-6 flex items-center gap-4">
            <div className="bg-primary rounded-md p-3 flex items-center justify-center">
              <CloudIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">Detailed analytics for event performance.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CloudIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function DatabaseIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function LaptopIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </svg>
  );
}

function SmartphoneIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
