// Offline sync utility
import { offlineDB } from './offlineDB';

export const isOnline = () => navigator.onLine;

export const syncPendingOrders = async () => {
  if (!isOnline()) {
    console.log('Offline - orders will sync when online');
    return;
  }

  try {
    const pendingOrders = await offlineDB.getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order.data),
        });

        if (response.ok) {
          await offlineDB.removePendingOrder(order.id);
          console.log('Order synced successfully:', order.id);
        }
      } catch (error) {
        console.error('Failed to sync order:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing orders:', error);
  }
};

export const syncProducts = async () => {
  if (!isOnline()) {
    console.log('Offline - using cached products');
    return await offlineDB.getProducts();
  }

  try {
    const response = await fetch('http://localhost:5000/api/products');
    if (response.ok) {
      const products = await response.json();
      await offlineDB.saveProducts(products);
      return products;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return cached products if fetch fails
    return await offlineDB.getProducts();
  }
};

// Listen for online/offline events
export const setupOfflineListeners = (onOnline, onOffline) => {
  window.addEventListener('online', () => {
    console.log('Back online - syncing data');
    syncPendingOrders();
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline - using cached data');
    if (onOffline) onOffline();
  });
};


