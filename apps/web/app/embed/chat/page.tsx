"use client";

import { useEffect, useState, useCallback } from "react";

export default function EmbedChatPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/mcp/status", { credentials: "include" });
      const data = await res.json();
      setConnected(data.connected === true);
      setError(null);
    } catch {
      setConnected(false);
      setError("Could not check connection status");
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const err = params.get("error");
    if (err) {
      setError(decodeURIComponent(err));
      window.history.replaceState({}, "", "/embed/chat");
    }
    checkStatus();
  }, [checkStatus]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !connected) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mcp/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 401 && data.needsAuth) {
        setConnected(false);
        setError("Session expired. Please connect Notion again.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "" },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (connected === null) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loading}>Checking connection…</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Connect Notion MCP</h2>
          <p style={styles.help}>
            Chat with AI over your Notion workspace. Shop Pilot syncs your store data into Notion;
            connect below to let the AI search reports, dashboards, and more.
          </p>
          {error && (
            <p style={styles.error}>{error}</p>
          )}
          <a
            href="/api/mcp/auth/start"
            target="_top"
            rel="noopener noreferrer"
            style={{ ...styles.button, display: "inline-block", textDecoration: "none", textAlign: "center" }}
          >
            Connect Notion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Shop Pilot + Notion MCP</span>
      </div>
      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.placeholder}>
            Ask about your store data in Notion: &quot;What are my top products?&quot; or
            &quot;Summarize this week&apos;s report.&quot;
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(m.role === "user" ? styles.userMessage : styles.assistantMessage),
            }}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.message, ...styles.assistantMessage }}>
            Thinking…
          </div>
        )}
      </div>
      <div style={styles.inputRow}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about your store data in Notion…"
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    maxWidth: 420,
    padding: 32,
    background: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  loading: {
    margin: 0,
    color: "#666",
  },
  title: {
    margin: "0 0 12px",
    fontSize: 20,
    fontWeight: 600,
    color: "#1e1a16",
  },
  help: {
    margin: "0 0 20px",
    fontSize: 14,
    lineHeight: 1.5,
    color: "#555",
  },
  error: {
    margin: "0 0 16px",
    padding: 12,
    background: "#fef2f2",
    borderRadius: 8,
    fontSize: 13,
    color: "#991b1b",
  },
  button: {
    padding: "12px 24px",
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "400px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.9)",
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e1a16",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  placeholder: {
    margin: 0,
    color: "#888",
    fontSize: 14,
  },
  message: {
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.5,
    maxWidth: "90%",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "#0f766e",
    color: "white",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    background: "#f5f0e8",
    color: "#1e1a16",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 16,
    borderTop: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.9)",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 10,
    fontSize: 14,
  },
  sendButton: {
    padding: "12px 20px",
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};
