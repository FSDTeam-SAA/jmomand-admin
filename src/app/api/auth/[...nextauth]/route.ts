import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handelar = NextAuth(authOptions);

export { handelar as GET, handelar as POST };