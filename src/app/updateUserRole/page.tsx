"use client";
import { useSession } from "next-auth/react";
import React from "react";

const page = () => {
  const { data: session } = useSession();
  const update = async () => {
    if (session) {
      try {
        const res = await fetch(`/api/users/${session.user.id}`, {
          method: "POST",
        });
        if (!res.ok) {
          throw new Error("Failed to update user role");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div>
      <button className="mt-16" onClick={() => update()}>
        Update user role
      </button>
    </div>
  );
};

export default page;
