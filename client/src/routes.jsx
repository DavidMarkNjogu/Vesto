// Centralized Route Definitions
export const ROUTES = {
  // PUBLIC SHOP
  SHOP: {
    HOME: '/',
    PRODUCT_LIST: '/products',
    PRODUCT_DETAIL: '/product/:id',
    CART: '/cart',
    CHECKOUT: '/checkout',
    SUCCESS: '/checkout/success',
    TRACKING: '/track-order',
    WISHLIST: '/wishlist',
  },
  
  // AUTHENTICATION
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // ADMIN DASHBOARD
  ADMIN: {
    DASHBOARD: '/admin',
    // Inventory
    INVENTORY: '/admin/inventory',
    ADD_PRODUCT: '/admin/inventory/add',
    EDIT_PRODUCT: '/admin/inventory/edit/:id',
    VARIANTS: '/admin/inventory/variants',
    // Orders
    ORDERS: '/admin/orders',
    ORDER_DETAIL: '/admin/orders/:id',
    RETURNS: '/admin/orders/returns',
    // Customers
    CUSTOMERS: '/admin/customers',
    CUSTOMER_DETAIL: '/admin/customers/:id',
    // Finance
    FINANCE: '/admin/finance',
    // Settings
    SETTINGS: '/admin/settings',
  },

  // SUPPLIER PORTAL
  SUPPLIER: {
    DASHBOARD: '/supplier',
    SHIPMENTS: '/supplier/shipments',
  }
};