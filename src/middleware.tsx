// export { auth as middleware } from "@/lib/auth";
export { default } from "next-auth/middleware";
export const config = { matcher: ["/admin", "/admin/:path*"] };
