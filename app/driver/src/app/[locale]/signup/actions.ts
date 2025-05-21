'use server';

import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';

export async function signUp(locale: string): Promise<void> {
  const cookieStore= await cookies();
  const token = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)?.value;

  const res = await fetch("http://localhost:3010/api/v0/auth/driver/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({authToken: await token}),
  });
  
  console.log("SIGNUP RESPONSE", res);
  console.log("SIGNUP RESPONSE", await res.json());

  if (res.status === 204) {
    redirect({
      href: '/driver/login',
      locale: locale
    });
  } else if (res.status === 201) {
    return;
  } else {
    cookieStore.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
    throw new Error("Error signing up");
  }
}

export async function setOnBoardingState(state: string): Promise<void> {
  const cookieStore= await cookies();
  const token = cookieStore.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)?.value;
  console.log("Setting onboarding state to", state);
  const res = await fetch("http://localhost:3010/api/v0/auth/driver/onboarding", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({newState: state}),
  });

  if (!res.ok) {
    cookieStore.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
    throw new Error("Error setting onboarding state");
  }
  console.log(res.status);
}