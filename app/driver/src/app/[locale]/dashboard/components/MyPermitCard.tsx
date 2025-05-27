"use client";

import { useEffect, useState } from "react";
import { Stack, Typography, Divider } from "@mui/material";
import CardButton from "./cardButton";
import { useTranslations } from "next-intl";
import type { MyPermits, Permit } from "../../types";
import { getMyPermits } from "../permitActions"

export default function MyPermitsCard() {
  const tp = useTranslations("permits");
  const [data, setData] = useState<MyPermits | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getMyPermits()
      .then((res) => {
        const hasPermits = res.active.length || res.future.length || res.expired.length;
        if (hasPermits) setData(res);
      })
      .catch((e: unknown) => console.error("Permit fetch failed", e));
  }, []);

  if (!data) return null;

  const renderPermits = (title: string, permits: Permit[]) => {
    if (permits.length === 0) return null;

    return (
      <>
        <Typography fontWeight="bold" variant="body2" sx={{ mt: 1 }}>
          {title}
        </Typography>
        {permits.map((p, idx) => (
          <Typography key={idx} variant="body2">
            {tp(p.type)} - {tp("area")}: {p.area}<br />
            {tp("active")}: {new Date(p.activeDate!).toLocaleString()}<br />
            {tp("expires")}: {new Date(p.expireDate).toLocaleString()}
            {idx < permits.length - 1 && <Divider sx={{ my: 1 }} />}
          </Typography>
        ))}
      </>
    );
  };

  return (
    <CardButton
      text={tp("myPermits")}
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      icon=""
    >
      <Stack spacing={1}>
        {renderPermits(tp("activePermits"), data.active)}
        {renderPermits(tp("futurePermits"), data.future)}
        {renderPermits(tp("expiredPermits"), data.expired)}
      </Stack>
    </CardButton>
  );
}
