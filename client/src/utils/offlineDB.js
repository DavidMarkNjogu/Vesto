class OfflineDB {
  constructor() {
    this.db = null;
    this.dbName = 'vesto_offline_db';
    this.version = 2; // Incremented version to force upgrade for new stores
    this.initPromise = null;
  }

  // --- CORE INITIALIZATION (Robust Race Condition Fix) ---
  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 1. Products Store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: '_id' });
          productStore.createIndex('category', 'category', { unique: false });
        }
        
        // 2. Orders Store (For syncing later)
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'tempId' });
        }

        // 3. Cart Store (Persist cart locally)
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }

        // 4. Wishlist Store
        if (!db.objectStoreNames.contains('wishlist')) {
          db.createObjectStore('wishlist', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('✅ IndexedDB Connected');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('❌ IndexedDB Error:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.initPromise;
  }

  // Helper: Ensures DB is ready before any operation
  async ensureDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // --- 1. PRODUCT OPERATIONS ---

  async saveProducts(products) {
    try {
      const db = await this.ensureDb();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readwrite');
        const store = transaction.objectStore('products');

        products.forEach((product) => {
          if (product && product._id) {
             store.put(product);
          }
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => {
            console.warn('DB Write Error', e);
            resolve();
        };
      });
    } catch (error) {
      console.error('Save Products Failed:', error);
    }
  }

  async getProducts() {
    try {
      const db = await this.ensureDb();
      if (!db) return [];

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      return [];
    }
  }

  async getProduct(id) {
    try {
      const db = await this.ensureDb();
      if (!db) return null;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      return null;
    }
  }

  // --- 2. ORDER OPERATIONS ---

  async saveOrder(order) {
    try {
      const db = await this.ensureDb();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readwrite');
        const store = transaction.objectStore('orders');
        // Add timestamp and sync status
        store.add({ ...order, tempId: Date.now().toString(), synced: false, timestamp: Date.now() });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Save Order Failed:', error);
    }
  }

  async getPendingOrders() {
    try {
        const db = await this.ensureDb();
        if(!db) return [];
        return new Promise((resolve) => {
            const tx = db.transaction('orders', 'readonly');
            const store = tx.objectStore('orders');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve([]);
        });
    } catch (e) { return []; }
  }

  // --- 3. WISHLIST OPERATIONS ---

  async addToWishlist(product) {
    try {
        const db = await this.ensureDb();
        if(!db) return;
        const tx = db.transaction('wishlist', 'readwrite');
        const store = tx.objectStore('wishlist');
        await store.put({ id: product._id, ...product });
    } catch (e) { console.error(e); }
  }

  async getWishlist() {
    try {
        const db = await this.ensureDb();
        if(!db) return [];
        return new Promise((resolve) => {
            const tx = db.transaction('wishlist', 'readonly');
            const store = tx.objectStore('wishlist');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve([]);
        });
    } catch (e) { return []; }
  }

  async removeFromWishlist(id) {
    try {
        const db = await this.ensureDb();
        if(!db) return;
        const tx = db.transaction('wishlist', 'readwrite');
        const store = tx.objectStore('wishlist');
        await store.delete(id);
    } catch (e) { console.error(e); }
  }
}

export const offlineDB = new OfflineDB();