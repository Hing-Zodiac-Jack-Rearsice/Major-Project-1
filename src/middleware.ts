// // export { default } from "next-auth/middleware";
// import { auth } from "@/lib/auth";
// import { NextResponse } from "next/server";

// export default auth((req) => {
//   if (req.nextUrl.pathname.startsWith("/admin")) {
//     if (req.auth?.user.role !== "admin") {
//       console.log("unauthorized");
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     } else {
//       console.log("authorized");
//     }
//   }
//   if (req.nextUrl.pathname.startsWith("/super-admin")) {
//     if (req.auth?.user.role !== "super_admin") {
//       console.log("unauthorized");
//       return NextResponse.redirect(new URL("/unauthorized", req.url));
//     } else {
//       console.log("authorized");
//     }
//   }
//   // console.log({ req });
// });
// // export { auth as middleware } from "@/lib/auth";
// // middleware for checking the role from the req.auth object
// export const config = { matcher: ["/admin/:path*"] };

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  console.log("Middleware - User role:", req.auth?.user.role);

  if (req.nextUrl.pathname.startsWith("/super-admin")) {
    if (req.auth?.user.role !== "super_admin") {
      console.log("Unauthorized access to super-admin route");
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    } else {
      console.log("Authorized access to super-admin route");
    }
  }
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (req.auth?.user.role !== "admin") {
      const redirectUrl = new URL("/", req.url);
      // Add a message parameter
      redirectUrl.searchParams.set("message", "You must be an event organizer to access this page");
      console.log("Unauthorized access to admin route");
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log("Authorized access to admin route");
    }
  }
  if (req.nextUrl.pathname.startsWith("/tickets")) {
    if (req.auth?.user.role !== "user") {
      // Add a message parameter
      const redirectUrl = new URL("/", req.url);
      // Add a message parameter
      redirectUrl.searchParams.set("message", "You must be logged in order to view tickets");
      console.log("Unauthorized access to admin route");
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log("Authorized access to this route");
    }
  }
});

export const config = { matcher: ["/admin/:path*", "/super-admin/:path*", "/tickets"] };
