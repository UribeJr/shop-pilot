"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner, Button } from "@shopify/polaris";

export function GenerateDummyDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync/dummy");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Dummy sync failed");
      }
      setMessage({
        type: "success",
        text: "Dummy data synced to your Notion dashboard. Use it for quick testing."
      });
      router.refresh();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Something went wrong";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {message && (
        <Banner tone={message.type === "error" ? "critical" : "success"} onDismiss={() => setMessage(null)}>
          {message.text}
        </Banner>
      )}
      <Button variant="secondary" onClick={handleGenerate} loading={loading}>
        Generate Dummy Data
      </Button>
    </div>
  );
}
