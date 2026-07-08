"use client";

export const PASSWORD_RESET_TOKEN_KEY = "jmomand_admin_password_reset_token";

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type TokenResponse = {
  accessToken?: string;
};

export function writePasswordResetToken(token: string) {
  localStorage.setItem(PASSWORD_RESET_TOKEN_KEY, token);
}

export function readPasswordResetToken() {
  return localStorage.getItem(PASSWORD_RESET_TOKEN_KEY);
}

export function removePasswordResetToken() {
  localStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
}

export async function authPost<T = unknown>(
  path: string,
  body: unknown,
  token?: string | null,
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export type { TokenResponse };
