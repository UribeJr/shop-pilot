import type { ShopifyStoreSnapshot } from "@notion-store-analyst/shared";
import { DEMO_SHOP_DOMAIN } from "@notion-store-analyst/shared";

const DUMMY_TEST_DOMAIN = "demo-test-store.myshopify.com";

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

/** Hefty dummy snapshot for Notion testing: 20+ orders, 15 products, varied inventory to trigger KPIs and alerts. */
export function getHeftyDemoShopifySnapshot(): ShopifyStoreSnapshot {
  return {
    shop: {
      id: "gid://shopify/Shop/demo",
      name: "Demo Test Store",
      domain: DUMMY_TEST_DOMAIN,
      currencyCode: "USD",
      planDisplayName: "Shopify Plus"
    },
    windows: [
      { label: "7d", start: "2026-03-14T00:00:00.000Z", end: "2026-03-21T23:59:59.000Z" },
      { label: "30d", start: "2026-02-20T00:00:00.000Z", end: "2026-03-21T23:59:59.000Z" }
    ],
    orders: [
      { id: "gid://shopify/Order/1", name: "#1050", createdAt: "2026-03-21T14:00:00.000Z", paid: true, totalPrice: { amount: 299, currencyCode: "USD" }, customerId: "gid://shopify/Customer/1", customerEmail: "alex@test.com", lineItems: [{ productId: "gid://shopify/Product/1", variantId: "gid://shopify/ProductVariant/1", title: "Premium Wool Sweater", sku: "APP-100", quantity: 2, price: 89 }, { productId: "gid://shopify/Product/2", variantId: "gid://shopify/ProductVariant/2", title: "Leather Wallet", sku: "ACC-201", quantity: 1, price: 121 }] },
      { id: "gid://shopify/Order/2", name: "#1049", createdAt: "2026-03-21T10:30:00.000Z", paid: true, totalPrice: { amount: 445, currencyCode: "USD" }, customerId: "gid://shopify/Customer/2", customerEmail: "jordan@test.com", lineItems: [{ productId: "gid://shopify/Product/3", variantId: "gid://shopify/ProductVariant/3", title: "Wireless Earbuds", sku: "ELE-301", quantity: 3, price: 79 }, { productId: "gid://shopify/Product/4", variantId: "gid://shopify/ProductVariant/4", title: "Yoga Mat Pro", sku: "FIT-401", quantity: 1, price: 89 }] },
      { id: "gid://shopify/Order/3", name: "#1048", createdAt: "2026-03-20T16:00:00.000Z", paid: true, totalPrice: { amount: 156, currencyCode: "USD" }, customerId: "gid://shopify/Customer/3", customerEmail: "sam@test.com", lineItems: [{ productId: "gid://shopify/Product/5", variantId: "gid://shopify/ProductVariant/5", title: "Organic Coffee Beans", sku: "F&B-501", quantity: 2, price: 28 }, { productId: "gid://shopify/Product/6", variantId: "gid://shopify/ProductVariant/6", title: "Ceramic Mug", sku: "HME-601", quantity: 4, price: 25 }] },
      { id: "gid://shopify/Order/4", name: "#1047", createdAt: "2026-03-20T09:00:00.000Z", paid: true, totalPrice: { amount: 189, currencyCode: "USD" }, customerId: "gid://shopify/Customer/1", customerEmail: "alex@test.com", lineItems: [{ productId: "gid://shopify/Product/7", variantId: "gid://shopify/ProductVariant/7", title: "Running Shoes", sku: "FIT-701", quantity: 1, price: 129 }, { productId: "gid://shopify/Product/8", variantId: "gid://shopify/ProductVariant/8", title: "Sports Socks 3-Pack", sku: "APP-801", quantity: 2, price: 30 }] },
      { id: "gid://shopify/Order/5", name: "#1046", createdAt: "2026-03-19T14:30:00.000Z", paid: true, totalPrice: { amount: 67, currencyCode: "USD" }, customerId: "gid://shopify/Customer/4", customerEmail: "taylor@test.com", lineItems: [{ productId: "gid://shopify/Product/9", variantId: "gid://shopify/ProductVariant/9", title: "Skincare Serum", sku: "BEA-901", quantity: 1, price: 67 }] },
      { id: "gid://shopify/Order/6", name: "#1045", createdAt: "2026-03-19T11:00:00.000Z", paid: true, totalPrice: { amount: 234, currencyCode: "USD" }, customerId: "gid://shopify/Customer/5", customerEmail: "riley@test.com", lineItems: [{ productId: "gid://shopify/Product/10", variantId: "gid://shopify/ProductVariant/10", title: "Laptop Stand", sku: "OFF-1001", quantity: 1, price: 89 }, { productId: "gid://shopify/Product/11", variantId: "gid://shopify/ProductVariant/11", title: "Mechanical Keyboard", sku: "ELE-1101", quantity: 1, price: 145 }] },
      { id: "gid://shopify/Order/7", name: "#1044", createdAt: "2026-03-18T17:00:00.000Z", paid: true, totalPrice: { amount: 412, currencyCode: "USD" }, customerId: "gid://shopify/Customer/2", customerEmail: "jordan@test.com", lineItems: [{ productId: "gid://shopify/Product/1", variantId: "gid://shopify/ProductVariant/1", title: "Premium Wool Sweater", sku: "APP-100", quantity: 3, price: 89 }, { productId: "gid://shopify/Product/12", variantId: "gid://shopify/ProductVariant/12", title: "Silk Scarf", sku: "ACC-1201", quantity: 1, price: 145 }] },
      { id: "gid://shopify/Order/8", name: "#1043", createdAt: "2026-03-18T13:00:00.000Z", paid: true, totalPrice: { amount: 98, currencyCode: "USD" }, customerId: "gid://shopify/Customer/6", customerEmail: "casey@test.com", lineItems: [{ productId: "gid://shopify/Product/13", variantId: "gid://shopify/ProductVariant/13", title: "Hydration Pack", sku: "OUT-1301", quantity: 1, price: 98 }] },
      { id: "gid://shopify/Order/9", name: "#1042", createdAt: "2026-03-17T15:30:00.000Z", paid: true, totalPrice: { amount: 178, currencyCode: "USD" }, customerId: "gid://shopify/Customer/3", customerEmail: "sam@test.com", lineItems: [{ productId: "gid://shopify/Product/4", variantId: "gid://shopify/ProductVariant/4", title: "Yoga Mat Pro", sku: "FIT-401", quantity: 2, price: 89 }] },
      { id: "gid://shopify/Order/10", name: "#1041", createdAt: "2026-03-17T09:00:00.000Z", paid: true, totalPrice: { amount: 56, currencyCode: "USD" }, customerId: "gid://shopify/Customer/7", customerEmail: "morgan@test.com", lineItems: [{ productId: "gid://shopify/Product/14", variantId: "gid://shopify/ProductVariant/14", title: "Notebook Set", sku: "OFF-1401", quantity: 2, price: 28 }] },
      { id: "gid://shopify/Order/11", name: "#1040", createdAt: "2026-03-16T16:00:00.000Z", paid: true, totalPrice: { amount: 203, currencyCode: "USD" }, customerId: "gid://shopify/Customer/1", customerEmail: "alex@test.com", lineItems: [{ productId: "gid://shopify/Product/15", variantId: "gid://shopify/ProductVariant/15", title: "Bluetooth Speaker", sku: "ELE-1501", quantity: 1, price: 99 }, { productId: "gid://shopify/Product/2", variantId: "gid://shopify/ProductVariant/2", title: "Leather Wallet", sku: "ACC-201", quantity: 1, price: 104 }] },
      { id: "gid://shopify/Order/12", name: "#1039", createdAt: "2026-03-16T11:00:00.000Z", paid: true, totalPrice: { amount: 334, currencyCode: "USD" }, customerId: "gid://shopify/Customer/8", customerEmail: "quinn@test.com", lineItems: [{ productId: "gid://shopify/Product/3", variantId: "gid://shopify/ProductVariant/3", title: "Wireless Earbuds", sku: "ELE-301", quantity: 4, price: 79 }] },
      { id: "gid://shopify/Order/13", name: "#1038", createdAt: "2026-03-15T14:00:00.000Z", paid: true, totalPrice: { amount: 145, currencyCode: "USD" }, customerId: "gid://shopify/Customer/4", customerEmail: "taylor@test.com", lineItems: [{ productId: "gid://shopify/Product/11", variantId: "gid://shopify/ProductVariant/11", title: "Mechanical Keyboard", sku: "ELE-1101", quantity: 1, price: 145 }] },
      { id: "gid://shopify/Order/14", name: "#1037", createdAt: "2026-03-15T10:00:00.000Z", paid: true, totalPrice: { amount: 267, currencyCode: "USD" }, customerId: "gid://shopify/Customer/2", customerEmail: "jordan@test.com", lineItems: [{ productId: "gid://shopify/Product/7", variantId: "gid://shopify/ProductVariant/7", title: "Running Shoes", sku: "FIT-701", quantity: 2, price: 129 }] },
      { id: "gid://shopify/Order/15", name: "#1036", createdAt: "2026-03-14T17:30:00.000Z", paid: true, totalPrice: { amount: 89, currencyCode: "USD" }, customerId: "gid://shopify/Customer/5", customerEmail: "riley@test.com", lineItems: [{ productId: "gid://shopify/Product/4", variantId: "gid://shopify/ProductVariant/4", title: "Yoga Mat Pro", sku: "FIT-401", quantity: 1, price: 89 }] },
      { id: "gid://shopify/Order/16", name: "#1035", createdAt: "2026-03-05T12:00:00.000Z", paid: true, totalPrice: { amount: 198, currencyCode: "USD" }, customerId: "gid://shopify/Customer/1", customerEmail: "alex@test.com", lineItems: [{ productId: "gid://shopify/Product/10", variantId: "gid://shopify/ProductVariant/10", title: "Laptop Stand", sku: "OFF-1001", quantity: 2, price: 89 }] },
      { id: "gid://shopify/Order/17", name: "#1034", createdAt: "2026-03-02T15:00:00.000Z", paid: true, totalPrice: { amount: 76, currencyCode: "USD" }, customerId: "gid://shopify/Customer/9", customerEmail: "parker@test.com", lineItems: [{ productId: "gid://shopify/Product/6", variantId: "gid://shopify/ProductVariant/6", title: "Ceramic Mug", sku: "HME-601", quantity: 2, price: 25 }, { productId: "gid://shopify/Product/5", variantId: "gid://shopify/ProductVariant/5", title: "Organic Coffee Beans", sku: "F&B-501", quantity: 1, price: 26 }] },
      { id: "gid://shopify/Order/18", name: "#1033", createdAt: "2026-02-28T11:30:00.000Z", paid: true, totalPrice: { amount: 312, currencyCode: "USD" }, customerId: "gid://shopify/Customer/2", customerEmail: "jordan@test.com", lineItems: [{ productId: "gid://shopify/Product/1", variantId: "gid://shopify/ProductVariant/1", title: "Premium Wool Sweater", sku: "APP-100", quantity: 2, price: 89 }, { productId: "gid://shopify/Product/12", variantId: "gid://shopify/ProductVariant/12", title: "Silk Scarf", sku: "ACC-1201", quantity: 1, price: 134 }] }
    ],
    products: [
      { id: "gid://shopify/Product/1", title: "Premium Wool Sweater", handle: "premium-wool-sweater", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Fall Collection"], variants: [{ id: "gid://shopify/ProductVariant/1", title: "Default", sku: "APP-100", price: 89 }] },
      { id: "gid://shopify/Product/2", title: "Leather Wallet", handle: "leather-wallet", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Accessories"], variants: [{ id: "gid://shopify/ProductVariant/2", title: "Default", sku: "ACC-201", price: 104 }] },
      { id: "gid://shopify/Product/3", title: "Wireless Earbuds", handle: "wireless-earbuds", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Electronics"], variants: [{ id: "gid://shopify/ProductVariant/3", title: "Default", sku: "ELE-301", price: 79 }] },
      { id: "gid://shopify/Product/4", title: "Yoga Mat Pro", handle: "yoga-mat-pro", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Fitness"], variants: [{ id: "gid://shopify/ProductVariant/4", title: "Default", sku: "FIT-401", price: 89 }] },
      { id: "gid://shopify/Product/5", title: "Organic Coffee Beans", handle: "organic-coffee", status: "ACTIVE", vendor: "Demo Test", featured: false, collectionTitles: ["Food & Beverage"], variants: [{ id: "gid://shopify/ProductVariant/5", title: "Default", sku: "F&B-501", price: 28 }] },
      { id: "gid://shopify/Product/6", title: "Ceramic Mug", handle: "ceramic-mug", status: "ACTIVE", vendor: "Demo Test", featured: false, collectionTitles: ["Home"], variants: [{ id: "gid://shopify/ProductVariant/6", title: "Default", sku: "HME-601", price: 25 }] },
      { id: "gid://shopify/Product/7", title: "Running Shoes", handle: "running-shoes", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Fitness"], variants: [{ id: "gid://shopify/ProductVariant/7", title: "Default", sku: "FIT-701", price: 129 }] },
      { id: "gid://shopify/Product/8", title: "Sports Socks 3-Pack", handle: "sports-socks", status: "ACTIVE", vendor: "Demo Test", featured: false, collectionTitles: ["Apparel"], variants: [{ id: "gid://shopify/ProductVariant/8", title: "Default", sku: "APP-801", price: 30 }] },
      { id: "gid://shopify/Product/9", title: "Skincare Serum", handle: "skincare-serum", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Beauty"], variants: [{ id: "gid://shopify/ProductVariant/9", title: "Default", sku: "BEA-901", price: 67 }] },
      { id: "gid://shopify/Product/10", title: "Laptop Stand", handle: "laptop-stand", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Office"], variants: [{ id: "gid://shopify/ProductVariant/10", title: "Default", sku: "OFF-1001", price: 89 }] },
      { id: "gid://shopify/Product/11", title: "Mechanical Keyboard", handle: "mechanical-keyboard", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Electronics"], variants: [{ id: "gid://shopify/ProductVariant/11", title: "Default", sku: "ELE-1101", price: 145 }] },
      { id: "gid://shopify/Product/12", title: "Silk Scarf", handle: "silk-scarf", status: "ACTIVE", vendor: "Demo Test", featured: false, collectionTitles: ["Accessories"], variants: [{ id: "gid://shopify/ProductVariant/12", title: "Default", sku: "ACC-1201", price: 145 }] },
      { id: "gid://shopify/Product/13", title: "Hydration Pack", handle: "hydration-pack", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Outdoor"], variants: [{ id: "gid://shopify/ProductVariant/13", title: "Default", sku: "OUT-1301", price: 98 }] },
      { id: "gid://shopify/Product/14", title: "Notebook Set", handle: "notebook-set", status: "ACTIVE", vendor: "Demo Test", featured: false, collectionTitles: ["Office"], variants: [{ id: "gid://shopify/ProductVariant/14", title: "Default", sku: "OFF-1401", price: 28 }] },
      { id: "gid://shopify/Product/15", title: "Bluetooth Speaker", handle: "bluetooth-speaker", status: "ACTIVE", vendor: "Demo Test", featured: true, collectionTitles: ["Electronics"], variants: [{ id: "gid://shopify/ProductVariant/15", title: "Default", sku: "ELE-1501", price: 99 }] }
    ],
    customers: [
      { id: "gid://shopify/Customer/1", email: "alex@test.com", displayName: "Alex Chen", ordersCount: 5 },
      { id: "gid://shopify/Customer/2", email: "jordan@test.com", displayName: "Jordan Lee", ordersCount: 5 },
      { id: "gid://shopify/Customer/3", email: "sam@test.com", displayName: "Sam Taylor", ordersCount: 3 },
      { id: "gid://shopify/Customer/4", email: "taylor@test.com", displayName: "Taylor Morgan", ordersCount: 2 },
      { id: "gid://shopify/Customer/5", email: "riley@test.com", displayName: "Riley Clark", ordersCount: 2 },
      { id: "gid://shopify/Customer/6", email: "casey@test.com", displayName: "Casey Evans", ordersCount: 1 },
      { id: "gid://shopify/Customer/7", email: "morgan@test.com", displayName: "Morgan Bell", ordersCount: 1 },
      { id: "gid://shopify/Customer/8", email: "quinn@test.com", displayName: "Quinn Wright", ordersCount: 1 },
      { id: "gid://shopify/Customer/9", email: "parker@test.com", displayName: "Parker Hall", ordersCount: 1 }
    ],
    inventory: [
      { productId: "gid://shopify/Product/1", variantId: "gid://shopify/ProductVariant/1", sku: "APP-100", title: "Premium Wool Sweater", available: 4, threshold: 12 },
      { productId: "gid://shopify/Product/2", variantId: "gid://shopify/ProductVariant/2", sku: "ACC-201", title: "Leather Wallet", available: 2, threshold: 10 },
      { productId: "gid://shopify/Product/3", variantId: "gid://shopify/ProductVariant/3", sku: "ELE-301", title: "Wireless Earbuds", available: 18, threshold: 15 },
      { productId: "gid://shopify/Product/4", variantId: "gid://shopify/ProductVariant/4", sku: "FIT-401", title: "Yoga Mat Pro", available: 5, threshold: 10 },
      { productId: "gid://shopify/Product/5", variantId: "gid://shopify/ProductVariant/5", sku: "F&B-501", title: "Organic Coffee Beans", available: 1, threshold: 8 },
      { productId: "gid://shopify/Product/6", variantId: "gid://shopify/ProductVariant/6", sku: "HME-601", title: "Ceramic Mug", available: 22, threshold: 12 },
      { productId: "gid://shopify/Product/7", variantId: "gid://shopify/ProductVariant/7", sku: "FIT-701", title: "Running Shoes", available: 3, threshold: 8 },
      { productId: "gid://shopify/Product/9", variantId: "gid://shopify/ProductVariant/9", sku: "BEA-901", title: "Skincare Serum", available: 0, threshold: 5 },
      { productId: "gid://shopify/Product/10", variantId: "gid://shopify/ProductVariant/10", sku: "OFF-1001", title: "Laptop Stand", available: 7, threshold: 10 },
      { productId: "gid://shopify/Product/11", variantId: "gid://shopify/ProductVariant/11", sku: "ELE-1101", title: "Mechanical Keyboard", available: 6, threshold: 8 },
      { productId: "gid://shopify/Product/12", variantId: "gid://shopify/ProductVariant/12", sku: "ACC-1201", title: "Silk Scarf", available: 2, threshold: 6 }
    ]
  };
}
