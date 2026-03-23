import type { ShopifyStoreSnapshot } from "@notion-store-analyst/shared";
import {
  CUSTOMERS_QUERY,
  INVENTORY_QUERY,
  ORDERS_QUERY,
  PRODUCTS_QUERY,
  SHOP_QUERY
} from "./queries";

type GraphqlClient = {
  graphql<T>(query: string, options?: { variables?: Record<string, unknown> }): Promise<T>;
};

type ShopifyClientOptions = {
  shopDomain?: string;
  accessToken?: string;
  apiVersion?: string;
};

export class ShopifyAdminClient implements GraphqlClient {
  constructor(private readonly options: ShopifyClientOptions) {}

  async graphql<T>(query: string, options?: { variables?: Record<string, unknown> }): Promise<T> {
    if (!this.options.shopDomain || !this.options.accessToken) {
      throw new Error(
        "Shopify real mode requires SHOPIFY_SHOP_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN."
      );
    }

    const response = await fetch(
      `https://${this.options.shopDomain}/admin/api/${this.options.apiVersion ?? "2025-07"}/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.options.accessToken
        },
        body: JSON.stringify({
          query,
          variables: options?.variables ?? {}
        })
      }
    );

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      if (status === 401) {
        throw new Error(
          `Shopify returned 401 Unauthorized. The access token may be expired or invalid. Uninstall the app from your store, then re-install from /setup to get a fresh token.`
        );
      }
      throw new Error(`Shopify GraphQL request failed with ${status} ${response.statusText}${body ? `: ${body.slice(0, 200)}` : ""}`);
    }

    const json = (await response.json()) as { data: T; errors?: unknown[] };
    if (json.errors?.length) {
      throw new Error(`Shopify GraphQL returned errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data;
  }
}

export async function fetchShopifySnapshot(client: GraphqlClient): Promise<ShopifyStoreSnapshot> {
  const now = new Date("2026-03-21T23:59:59.000Z");
  const sevenStart = new Date(now);
  sevenStart.setUTCDate(now.getUTCDate() - 7);
  const thirtyStart = new Date(now);
  thirtyStart.setUTCDate(now.getUTCDate() - 30);

  const shopData = await client.graphql<{
    shop: {
      id: string;
      name: string;
      myshopifyDomain: string;
      currencyCode: string;
      plan?: { publicDisplayName?: string | null } | null;
    };
  }>(SHOP_QUERY);
  const ordersData = await client.graphql<{
    orders: {
      nodes: Array<{
        id: string;
        name: string;
        createdAt: string;
        displayFinancialStatus: string;
        totalPriceSet: { shopMoney: { amount: string; currencyCode: string } };
        customer?: {
          id: string;
          defaultEmailAddress?: { emailAddress?: string | null } | null;
        } | null;
        lineItems: {
          nodes: Array<{
            title: string;
            quantity: number;
            originalUnitPriceSet?: { shopMoney?: { amount: string } | null } | null;
            product?: { id: string } | null;
            variant?: { id: string; sku?: string | null } | null;
          }>;
        };
      }>;
    };
  }>(ORDERS_QUERY, {
    variables: {
      first: 100,
      query: `processed_at:>=${thirtyStart.toISOString()} financial_status:paid`
    }
  });
  const productsData = await client.graphql<{
    products: {
      nodes: Array<{
        id: string;
        title: string;
        handle: string;
        status: string;
        vendor?: string | null;
        collections?: { nodes: Array<{ title: string }> };
        variants: { nodes: Array<{ id: string; title: string; sku?: string | null; price: string }> };
      }>;
    };
  }>(PRODUCTS_QUERY, { variables: { first: 100 } });
  const customersData = await client.graphql<{
    customers: {
      nodes: Array<{
        id: string;
      email?: string | null;
      defaultEmailAddress?: { emailAddress?: string | null } | null;
      displayName: string;
      numberOfOrders: string;
      }>;
    };
  }>(CUSTOMERS_QUERY, { variables: { first: 100 } });
  const inventoryData = await client.graphql<{
    productVariants: {
      nodes: Array<{
        id: string;
        sku?: string | null;
        title: string;
        inventoryQuantity?: number | null;
        product: { id: string; title: string };
      }>;
    };
  }>(INVENTORY_QUERY, { variables: { first: 100 } });

  return {
    shop: {
      id: shopData.shop.id,
      name: shopData.shop.name,
      domain: shopData.shop.myshopifyDomain,
      currencyCode: shopData.shop.currencyCode,
      planDisplayName: shopData.shop.plan?.publicDisplayName ?? null
    },
    windows: [
      { label: "7d", start: sevenStart.toISOString(), end: now.toISOString() },
      { label: "30d", start: thirtyStart.toISOString(), end: now.toISOString() }
    ],
    orders: ordersData.orders.nodes.map((order) => ({
      id: order.id,
      name: order.name,
      createdAt: order.createdAt,
      paid: order.displayFinancialStatus === "PAID",
      totalPrice: {
        amount: Number(order.totalPriceSet.shopMoney.amount),
        currencyCode: order.totalPriceSet.shopMoney.currencyCode
      },
      customerId: order.customer?.id ?? null,
      customerEmail: order.customer?.defaultEmailAddress?.emailAddress ?? null,
      lineItems: order.lineItems.nodes
        .filter((item) => item.product?.id)
        .map((item) => ({
          productId: item.product!.id,
          variantId: item.variant?.id ?? null,
          title: item.title,
          sku: item.variant?.sku ?? null,
          quantity: item.quantity,
          price: Number(item.originalUnitPriceSet?.shopMoney?.amount ?? "0")
        }))
    })),
    products: productsData.products.nodes.map((product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      status: product.status,
      vendor: product.vendor ?? null,
      featured: false,
      collectionTitles: product.collections?.nodes.map((collection) => collection.title) ?? [],
      variants: product.variants.nodes.map((variant) => ({
        id: variant.id,
        title: variant.title,
        sku: variant.sku ?? null,
        price: Number(variant.price)
      }))
    })),
    customers: customersData.customers.nodes.map((customer) => ({
      id: customer.id,
      email: customer.defaultEmailAddress?.emailAddress ?? null,
      displayName: customer.displayName,
      ordersCount: Number(customer.numberOfOrders)
    })),
    inventory: inventoryData.productVariants.nodes.map((variant) => ({
      productId: variant.product.id,
      variantId: variant.id,
      sku: variant.sku ?? null,
      title: variant.product.title,
      available: variant.inventoryQuantity ?? 0,
      threshold: 8
    }))
  };
}
