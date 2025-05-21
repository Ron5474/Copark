'use server';

import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";

export async function userLoginSignUpAttempt(locale: string): Promise<string|undefined> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);

  const res = await fetch("http://localhost:3010/api/v0/auth/driver/login", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authCookie?.value}`,
    },
  })
  
  if (res.status !== 201 && res.status !== 200 && res.status !== 204) {
    return redirect({
      href: '/driver/login',
      locale: locale
      });
  }
  
  return "Login/SignUp attempt successful";
}