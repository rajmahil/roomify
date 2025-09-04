// app/_components/AuthBootstrap.tsx
"use client";
import { useEffect, useRef } from "react";

export default function AuthBootstrap() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Ensure anon session is established once
    fetch("/api/auth/ensure-anon", { method: "POST" }).catch(console.error);
  }, []);

  return null;
}
