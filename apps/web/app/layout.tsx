import "@shopify/polaris/build/esm/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { APP_NAME } from "@notion-store-analyst/shared";
import { EmbeddedAppProvider } from "../components/embedded-app-provider";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Notion-led Shopify analytics workspace for challenge demos."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EmbeddedAppProvider>{children}</EmbeddedAppProvider>
      </body>
    </html>
  );
}
