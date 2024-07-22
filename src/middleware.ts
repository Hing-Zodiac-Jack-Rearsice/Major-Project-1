// export { default } from "next-auth/middleware";
import { auth } from "@/lib/auth";

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (req.auth?.user.role !== "admin") {
      console.log("unauthorized");
    }
  }
  console.log({ req });
});
// export { auth as middleware } from "@/lib/auth";

export const config = { matcher: ["/admin/:path*"] };
