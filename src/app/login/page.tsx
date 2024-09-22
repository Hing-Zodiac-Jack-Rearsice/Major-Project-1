import { SignIn } from "@/components/sign-in";
import { Button } from "@/components/ui/button";
import { SignupFormDemo } from "@/components/ui/SignUpFormDemo";

import React from "react";

const page = () => {
  return (
    <div className="mt-16">
      {/* <SignIn /> */}
      <SignupFormDemo />
    </div>
  );
};

export default page;
