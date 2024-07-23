// export { default } from "next-auth/middleware";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (req.auth?.user.role !== "admin") {
      console.log("unauthorized");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    } else {
      console.log("authorized");
    }
  }
  // console.log({ req });
});
// export { auth as middleware } from "@/lib/auth";
// middleware for checking the role from the req.auth object
export const config = { matcher: ["/admin/:path*"] };
