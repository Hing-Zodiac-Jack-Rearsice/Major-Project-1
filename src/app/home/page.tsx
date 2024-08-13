"use client";
import { useSession } from "next-auth/react";
import React from "react";

const page = () => {
  const { data: session } = useSession();
  return (
    <div className="mt-16">
      <p>HOme</p>
      <img src="/logo-light.svg" alt="" />
    </div>
  );
};

export default page;
