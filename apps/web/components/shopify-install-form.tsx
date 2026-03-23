"use client";

import { useState } from "react";
import { Button, InlineStack, TextField } from "@shopify/polaris";

export function ShopifyInstallForm() {
  const [shop, setShop] = useState("");

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop.trim()) return;
    const form = e.currentTarget as HTMLFormElement;
    form.submit();
  };

  return (
    <form
      onSubmit={handleConnect}
      action="/api/shopify/install"
      method="GET"
      target="_top"
      style={{ display: "contents" }}
    >
      <InlineStack gap="300" align="start" blockAlign="center">
        <div style={{ minWidth: 320 }}>
          <TextField
            label="Store domain"
            autoComplete="off"
            value={shop}
            onChange={setShop}
            placeholder="your-store.myshopify.com"
            helpText="Any Shopify store — dev or production. Starts OAuth install."
          />
        </div>
        <input type="hidden" name="shop" value={shop} />
        <Button variant="primary" submit>
          Connect store
        </Button>
      </InlineStack>
    </form>
  );
}
