"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner, Button } from "@shopify/polaris";

export function GenerateReportButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      if (!res.ok) {
        const msg = data.reinstallHint ? `${data.error} ${data.reinstallHint}` : (data.error ?? "Sync failed");
        throw new Error(msg);
      }
      setMessage({ type: "success", text: "Report generated. Data synced to your Notion dashboard." });
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
        <Banner tone={message.type} onDismiss={() => setMessage(null)}>
          {message.text}
        </Banner>
      )}
      <Button variant="primary" onClick={handleGenerate} loading={loading}>
        Generate report now
      </Button>
    </div>
  );
}
