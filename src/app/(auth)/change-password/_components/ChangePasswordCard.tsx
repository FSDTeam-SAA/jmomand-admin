"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
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
  readPasswordResetToken,
  removePasswordResetToken,
} from "@/lib/auth-client";

const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordCard() {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!readPasswordResetToken()) {
      router.replace("/forgot-password");
    }
  }, [router]);

  const onSubmit = async (values: ChangePasswordValues) => {
    setError("");

    try {
      const token = readPasswordResetToken();
      await authPost(
        "/auth/reset-password",
        { newPassword: values.newPassword },
        token,
      );

      removePasswordResetToken();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password change failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f9] p-4">
      <div className="w-full max-w-[540px] rounded-xl border border-slate-100 bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Change password</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create a new password for your admin account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        placeholder="New password"
                        className="h-12 pr-12"
                      />
                      <button
                        type="button"
                        aria-label="Toggle new password"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="h-12 pr-12"
                      />
                      <button
                        type="button"
                        aria-label="Toggle confirm password"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
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
              {form.formState.isSubmitting ? "Changing..." : "Change password"}
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
