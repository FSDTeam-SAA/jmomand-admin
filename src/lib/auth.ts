import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface LoginResponse {
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      __v: number;
    };
    accessToken: string;
  };
  success: boolean;
  message: string;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 10, // 10 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          }
        );
        const data: LoginResponse = await res.json();
        // Check if login succeeded
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Invalid credentials");
        }
           console.log(data)
        const userData = data.data.user;
        const accessToken = data.data.accessToken;

        if (userData.role !== "admin") {
          throw new Error("Only admin users can access this dashboard");
        }

        return {
          id: String(userData._id), // coerce to string
          name: String(userData.name),
          email: String(userData.email),
          role: String(userData.role),
          accessToken: String(accessToken),
        };
      },
    }),
  ],
  callbacks: {
    // Add user info to JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    // Add JWT info to session
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name || "",
        email: token.email || "",
        role: token.role as string,
        accessToken: token.accessToken as string,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on error
  },
};

export default NextAuth(authOptions);
