"use client";

import { useState } from "react";
import { Button, InlineStack, TextField } from "@shopify/polaris";

export function ShopifyInstallForm() {
  const [shop, setShop] = useState("");

  return (
    <InlineStack gap="300" align="start" blockAlign="center">
      <div style={{ minWidth: 320 }}>
        <TextField
          label="Dev store domain"
          autoComplete="off"
          value={shop}
          onChange={setShop}
          placeholder="your-dev-store.myshopify.com"
          helpText="Starts the real Shopify OAuth install for this app."
        />
      </div>
      <Button
        variant="primary"
        onClick={() => {
          if (!shop) return;
          window.location.href = `/api/shopify/install?shop=${encodeURIComponent(shop)}`;
        }}
      >
        Install on dev store
      </Button>
    </InlineStack>
  );
}
