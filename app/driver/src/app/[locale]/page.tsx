'use client'

import { useEffect } from "react";
// import theme from "./theme"
import { getUser } from "./shared/actions";
import { useRouter } from "@/i18n/navigation";

export default function Home() {
  const  router = useRouter()

  useEffect(() => {
    const rediirect = async () => {
        if (await getUser()) {
          router.push(`/dashboard`);
          return;
        }
        router.push(`/login`);
      }
    rediirect()
      }, [router])

  return (
    <></>
  );
}
