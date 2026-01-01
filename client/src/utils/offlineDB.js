// IndexedDB wrapper for offline storage
class OfflineDB {
  constructor() {
    this.dbName = 'VestoShoesDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: '_id' });
          productStore.createIndex('category', 'category', { unique: false });
        }

        // Cart store
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }

        // Pending orders store
        if (!db.objectStoreNames.contains('pendingOrders')) {
          db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
        }

        // Wishlist store
        if (!db.objectStoreNames.contains('wishlist')) {
          db.createObjectStore('wishlist', { keyPath: 'id' });
        }
      };
    });
  }

  // Products
  async saveProducts(products) {
    const tx = this.db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    
    for (const product of products) {
      await store.put(product);
    }
    
    return tx.complete;
  }

  async getProducts() {
    const tx = this.db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    return store.getAll();
  }

  async getProduct(id) {
    const tx = this.db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    return store.get(id);
  }

  // Cart
  async saveCartItem(item) {
    const tx = this.db.transaction('cart', 'readwrite');
    const store = tx.objectStore('cart');
    await store.put(item);
    return tx.complete;
  }

  async getCartItems() {
    const tx = this.db.transaction('cart', 'readonly');
    const store = tx.objectStore('cart');
    return store.getAll();
  }

  async removeCartItem(id) {
    const tx = this.db.transaction('cart', 'readwrite');
    const store = tx.objectStore('cart');
    await store.delete(id);
    return tx.complete;
  }

  async clearCart() {
    const tx = this.db.transaction('cart', 'readwrite');
    const store = tx.objectStore('cart');
    await store.clear();
    return tx.complete;
  }

  // Pending Orders
  async savePendingOrder(orderData) {
    const tx = this.db.transaction('pendingOrders', 'readwrite');
    const store = tx.objectStore('pendingOrders');
    const id = await store.add({ data: orderData, timestamp: Date.now() });
    return id;
  }

  async getPendingOrders() {
    const tx = this.db.transaction('pendingOrders', 'readonly');
    const store = tx.objectStore('pendingOrders');
    return store.getAll();
  }

  async removePendingOrder(id) {
    const tx = this.db.transaction('pendingOrders', 'readwrite');
    const store = tx.objectStore('pendingOrders');
    await store.delete(id);
    return tx.complete;
  }

  // Wishlist
  async addToWishlist(product) {
    const tx = this.db.transaction('wishlist', 'readwrite');
    const store = tx.objectStore('wishlist');
    await store.put({ id: product._id, ...product });
    return tx.complete;
  }

  async getWishlist() {
    const tx = this.db.transaction('wishlist', 'readonly');
    const store = tx.objectStore('wishlist');
    return store.getAll();
  }

  async removeFromWishlist(id) {
    const tx = this.db.transaction('wishlist', 'readwrite');
    const store = tx.objectStore('wishlist');
    await store.delete(id);
    return tx.complete;
  }

  async isInWishlist(id) {
    const tx = this.db.transaction('wishlist', 'readonly');
    const store = tx.objectStore('wishlist');
    const item = await store.get(id);
    return !!item;
  }
}

export const offlineDB = new OfflineDB();


