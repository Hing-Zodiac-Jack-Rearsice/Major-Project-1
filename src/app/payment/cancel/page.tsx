import React from "react";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/hhICV5ffgAo
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link";

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-100 dark:bg-black px-4 md:px-6">
      <div className="max-w-md w-full bg-white dark:bg-black rounded-xl shadow-lg p-8 space-y-6 border-[1px]">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CircleXIcon className="text-red-500 w-16 h-16" />
          <h1 className="text-3xl font-bold">Payment Canceled</h1>
          <p className="text-gray-500 dark:text-gray-400">Looks like you canceled the payment.</p>
        </div>
        <Link
          href="/events"
          className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300 w-full"
          prefetch={false}
        >
          Back to events
        </Link>
      </div>
    </div>
  );
}

function CircleXIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
