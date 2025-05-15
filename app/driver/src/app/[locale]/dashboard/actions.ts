'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function userLoginSignUpAttempt(): Promise<string|undefined> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);

  const res = await fetch("http://localhost:3010/api/v0/auth/driver/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authCookie?.value}`,
    },
  })
  
  if (res.status !== 201 && res.status !== 200 && res.status !== 204) {
    return undefined;
  }
  
  return "Login/SignUp attempt successful";
}

export async function testPay() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);

  const res = await fetch("http://localhost:3014/api/v0/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authCookie?.value}`,
    },body: JSON.stringify({
      item: "dailyPass",
    }),
  })
  
  const data = await res.json();
  if (data.url) {
    redirect(data.url);
  }
  
  return "Payment attempt successful";
}