"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  authPost,
  TokenResponse,
  writePasswordResetToken,
} from "@/lib/auth-client";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordCard() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setError("");

    try {
      const response = await authPost<TokenResponse>("/auth/forgot-password", {
        email: values.email,
      });

      if (response.data?.accessToken) {
        writePasswordResetToken(response.data.accessToken);
      }

      router.push("/otp-verification");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] p-4">
      <div className="w-full max-w-[540px] rounded-xl border border-slate-100 bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Forgot password</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email to receive a verification code
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="E-mail"
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-12 w-full bg-orange-500 hover:bg-orange-600"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send code"}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
