"use client";

import { AppProvider } from "@shopify/polaris";

const polarisI18n = {
  Polaris: {
    Common: {
      checkbox: "checkbox"
    }
  }
};

export function EmbeddedAppProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider i18n={polarisI18n}>{children}</AppProvider>;
}
