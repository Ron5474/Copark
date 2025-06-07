'use server';

import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";

export async function userLoginAttempt(locale: string): Promise<string|undefined> {
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
    cookieStore.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
    return await redirect({
      href: '/signup',
      locale: locale
      });
  }

  const data = await res.json();
  console.log("User data:", data);
  if (data?.onboardingState !== "complete") {
    if (data?.onboardingState === "tos") {
      return await redirect({
        href: '/onboarding/tos',
        locale: locale
        });
      }
      else if (data?.onboardingState === "first-vehicle") {
        return await redirect({
          href: '/onboarding/add-vehicle',
          locale: locale
          });
      } else {
        cookieStore.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
        return await redirect({
          href: '/signup',
          locale: locale
          });
        }
      } else {
       return "complete";
      }  
}