export const SHOP_QUERY = `#graphql
  query ShopInfo {
    shop {
      id
      name
      myshopifyDomain
      currencyCode
      plan {
        publicDisplayName
      }
    }
  }
`;

export const ORDERS_QUERY = `#graphql
  query OrdersForAnalytics($first: Int!, $query: String!) {
    orders(first: $first, sortKey: PROCESSED_AT, reverse: true, query: $query) {
      nodes {
        id
        name
        createdAt
        displayFinancialStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        customer {
          id
          defaultEmailAddress {
            emailAddress
          }
        }
        lineItems(first: 50) {
          nodes {
            title
            quantity
            originalUnitPriceSet {
              shopMoney {
                amount
              }
            }
            product {
              id
            }
            variant {
              id
              sku
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = `#graphql
  query ProductsForAnalytics($first: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        status
        vendor
        collections(first: 10) {
          nodes {
            title
          }
        }
        variants(first: 20) {
          nodes {
            id
            title
            sku
            price
          }
        }
      }
    }
  }
`;

export const CUSTOMERS_QUERY = `#graphql
  query CustomersForAnalytics($first: Int!) {
    customers(first: $first, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        defaultEmailAddress {
          emailAddress
        }
        displayName
        numberOfOrders
      }
    }
  }
`;

export const INVENTORY_QUERY = `#graphql
  query InventoryForAnalytics($first: Int!) {
    productVariants(first: $first, sortKey: ID, reverse: true) {
      nodes {
        id
        sku
        title
        inventoryQuantity
        product {
          id
          title
        }
      }
    }
  }
`;
