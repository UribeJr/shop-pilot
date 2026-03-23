import type { ShopifyStoreSnapshot } from "@notion-store-analyst/shared";
import { DEMO_SHOP_DOMAIN } from "@notion-store-analyst/shared";

export function getDemoShopifySnapshot(): ShopifyStoreSnapshot {
  return {
    shop: {
      id: "gid://shopify/Shop/1",
      name: "Northstar Goods",
      domain: DEMO_SHOP_DOMAIN,
      currencyCode: "USD",
      planDisplayName: "Shopify"
    },
    windows: [
      { label: "7d", start: "2026-03-14T00:00:00.000Z", end: "2026-03-21T23:59:59.000Z" },
      { label: "30d", start: "2026-02-20T00:00:00.000Z", end: "2026-03-21T23:59:59.000Z" }
    ],
    orders: [
      {
        id: "gid://shopify/Order/1",
        name: "#1001",
        createdAt: "2026-03-21T10:00:00.000Z",
        paid: true,
        totalPrice: { amount: 124, currencyCode: "USD" },
        customerId: "gid://shopify/Customer/1",
        customerEmail: "ava@example.com",
        lineItems: [
          {
            productId: "gid://shopify/Product/1",
            variantId: "gid://shopify/ProductVariant/1",
            title: "Spring Carry Tote",
            sku: "SPR-001",
            quantity: 2,
            price: 42
          },
          {
            productId: "gid://shopify/Product/3",
            variantId: "gid://shopify/ProductVariant/3",
            title: "Citrus Candle",
            sku: "HME-101",
            quantity: 1,
            price: 40
          }
        ]
      },
      {
        id: "gid://shopify/Order/2",
        name: "#1000",
        createdAt: "2026-03-18T12:00:00.000Z",
        paid: true,
        totalPrice: { amount: 86, currencyCode: "USD" },
        customerId: "gid://shopify/Customer/2",
        customerEmail: "milo@example.com",
        lineItems: [
          {
            productId: "gid://shopify/Product/2",
            variantId: "gid://shopify/ProductVariant/2",
            title: "Bloom Water Bottle",
            sku: "SPR-004",
            quantity: 2,
            price: 24
          },
          {
            productId: "gid://shopify/Product/4",
            variantId: "gid://shopify/ProductVariant/4",
            title: "Evergreen Hoodie",
            sku: "APP-220",
            quantity: 1,
            price: 38
          }
        ]
      },
      {
        id: "gid://shopify/Order/3",
        name: "#995",
        createdAt: "2026-03-02T09:00:00.000Z",
        paid: true,
        totalPrice: { amount: 52, currencyCode: "USD" },
        customerId: "gid://shopify/Customer/1",
        customerEmail: "ava@example.com",
        lineItems: [
          {
            productId: "gid://shopify/Product/2",
            variantId: "gid://shopify/ProductVariant/2",
            title: "Bloom Water Bottle",
            sku: "SPR-004",
            quantity: 1,
            price: 24
          },
          {
            productId: "gid://shopify/Product/5",
            variantId: "gid://shopify/ProductVariant/5",
            title: "Desk Notepad",
            sku: "DSK-020",
            quantity: 2,
            price: 14
          }
        ]
      },
      {
        id: "gid://shopify/Order/4",
        name: "#988",
        createdAt: "2026-02-24T14:00:00.000Z",
        paid: true,
        totalPrice: { amount: 44, currencyCode: "USD" },
        customerId: "gid://shopify/Customer/3",
        customerEmail: "nora@example.com",
        lineItems: [
          {
            productId: "gid://shopify/Product/4",
            variantId: "gid://shopify/ProductVariant/4",
            title: "Evergreen Hoodie",
            sku: "APP-220",
            quantity: 1,
            price: 44
          }
        ]
      }
    ],
    products: [
      {
        id: "gid://shopify/Product/1",
        title: "Spring Carry Tote",
        handle: "spring-carry-tote",
        status: "ACTIVE",
        vendor: "Northstar Goods",
        featured: true,
        collectionTitles: ["Spring Collection"],
        variants: [{ id: "gid://shopify/ProductVariant/1", title: "Default", sku: "SPR-001", price: 42 }]
      },
      {
        id: "gid://shopify/Product/2",
        title: "Bloom Water Bottle",
        handle: "bloom-water-bottle",
        status: "ACTIVE",
        vendor: "Northstar Goods",
        featured: true,
        collectionTitles: ["Spring Collection"],
        variants: [{ id: "gid://shopify/ProductVariant/2", title: "Default", sku: "SPR-004", price: 24 }]
      },
      {
        id: "gid://shopify/Product/3",
        title: "Citrus Candle",
        handle: "citrus-candle",
        status: "ACTIVE",
        vendor: "Northstar Goods",
        featured: false,
        collectionTitles: ["Home"],
        variants: [{ id: "gid://shopify/ProductVariant/3", title: "Default", sku: "HME-101", price: 40 }]
      },
      {
        id: "gid://shopify/Product/4",
        title: "Evergreen Hoodie",
        handle: "evergreen-hoodie",
        status: "ACTIVE",
        vendor: "Northstar Goods",
        featured: false,
        collectionTitles: ["Apparel"],
        variants: [{ id: "gid://shopify/ProductVariant/4", title: "Default", sku: "APP-220", price: 44 }]
      },
      {
        id: "gid://shopify/Product/5",
        title: "Desk Notepad",
        handle: "desk-notepad",
        status: "ACTIVE",
        vendor: "Northstar Goods",
        featured: false,
        collectionTitles: ["Desk"],
        variants: [{ id: "gid://shopify/ProductVariant/5", title: "Default", sku: "DSK-020", price: 14 }]
      }
    ],
    customers: [
      {
        id: "gid://shopify/Customer/1",
        email: "ava@example.com",
        displayName: "Ava Rivera",
        ordersCount: 2
      },
      {
        id: "gid://shopify/Customer/2",
        email: "milo@example.com",
        displayName: "Milo Park",
        ordersCount: 1
      },
      {
        id: "gid://shopify/Customer/3",
        email: "nora@example.com",
        displayName: "Nora Finch",
        ordersCount: 1
      }
    ],
    inventory: [
      {
        productId: "gid://shopify/Product/1",
        variantId: "gid://shopify/ProductVariant/1",
        sku: "SPR-001",
        title: "Spring Carry Tote",
        available: 6,
        threshold: 8
      },
      {
        productId: "gid://shopify/Product/2",
        variantId: "gid://shopify/ProductVariant/2",
        sku: "SPR-004",
        title: "Bloom Water Bottle",
        available: 18,
        threshold: 8
      },
      {
        productId: "gid://shopify/Product/4",
        variantId: "gid://shopify/ProductVariant/4",
        sku: "APP-220",
        title: "Evergreen Hoodie",
        available: 3,
        threshold: 8
      }
    ]
  };
}
