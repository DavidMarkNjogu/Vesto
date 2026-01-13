class OfflineDB {
  constructor() {
    this.db = null;
    this.dbName = 'vesto_offline_db';
    this.version = 1;
    this.initPromise = null; // Logic to handle the race condition
  }

  // Initialize the database
  async init() {
    if (this.initPromise) return this.initPromise; // Return existing promise if already initializing

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: '_id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'tempId' });
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

  // HELPER: Wait for DB before doing anything
  async ensureDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  // --- CRUD OPERATIONS ---

  async saveProducts(products) {
    try {
      const db = await this.ensureDb(); // Wait for connection
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
            resolve(); // Resolve anyway to prevent app crash
        };
      });
    } catch (error) {
      console.error('Save Products Failed:', error);
    }
  }

  async getProducts() {
    try {
      const db = await this.ensureDb(); // Wait for connection
      if (!db) return [];

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]); // Fallback to empty array
      });
    } catch (error) {
      console.error('Get Products Failed:', error);
      return [];
    }
  }

  async getProduct(id) {
    try {
      const db = await this.ensureDb(); // Wait for connection
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

  async saveOrder(order) {
    try {
      const db = await this.ensureDb();
      if (!db) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readwrite');
        const store = transaction.objectStore('orders');
        store.add({ ...order, tempId: Date.now().toString(), synced: false });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (e) => reject(e.target.error);
      });
    } catch (error) {
      console.error('Save Order Failed:', error);
    }
  }
}

export const offlineDB = new OfflineDB();
// // IndexedDB wrapper for offline storage
// class OfflineDB {
//   constructor() {
//     this.dbName = 'VestoShoesDB';
//     this.version = 1;
//     this.db = null;
//   }

//   async init() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, this.version);

//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve(this.db);
//       };

//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;

//         // Products store
//         if (!db.objectStoreNames.contains('products')) {
//           const productStore = db.createObjectStore('products', { keyPath: '_id' });
//           productStore.createIndex('category', 'category', { unique: false });
//         }

//         // Cart store
//         if (!db.objectStoreNames.contains('cart')) {
//           db.createObjectStore('cart', { keyPath: 'id' });
//         }

//         // Pending orders store
//         if (!db.objectStoreNames.contains('pendingOrders')) {
//           db.createObjectStore('pendingOrders', { keyPath: 'id', autoIncrement: true });
//         }

//         // Wishlist store
//         if (!db.objectStoreNames.contains('wishlist')) {
//           db.createObjectStore('wishlist', { keyPath: 'id' });
//         }
//       };
//     });
//   }

//   // Products
//   async saveProducts(products) {
//     const tx = this.db.transaction('products', 'readwrite');
//     const store = tx.objectStore('products');
    
//     for (const product of products) {
//       await store.put(product);
//     }
    
//     return tx.complete;
//   }

//   async getProducts() {
//     const tx = this.db.transaction('products', 'readonly');
//     const store = tx.objectStore('products');
//     return store.getAll();
//   }

//   async getProduct(id) {
//     const tx = this.db.transaction('products', 'readonly');
//     const store = tx.objectStore('products');
//     return store.get(id);
//   }

//   // Cart
//   async saveCartItem(item) {
//     const tx = this.db.transaction('cart', 'readwrite');
//     const store = tx.objectStore('cart');
//     await store.put(item);
//     return tx.complete;
//   }

//   async getCartItems() {
//     const tx = this.db.transaction('cart', 'readonly');
//     const store = tx.objectStore('cart');
//     return store.getAll();
//   }

//   async removeCartItem(id) {
//     const tx = this.db.transaction('cart', 'readwrite');
//     const store = tx.objectStore('cart');
//     await store.delete(id);
//     return tx.complete;
//   }

//   async clearCart() {
//     const tx = this.db.transaction('cart', 'readwrite');
//     const store = tx.objectStore('cart');
//     await store.clear();
//     return tx.complete;
//   }

//   // Pending Orders
//   async savePendingOrder(orderData) {
//     const tx = this.db.transaction('pendingOrders', 'readwrite');
//     const store = tx.objectStore('pendingOrders');
//     const id = await store.add({ data: orderData, timestamp: Date.now() });
//     return id;
//   }

//   async getPendingOrders() {
//     const tx = this.db.transaction('pendingOrders', 'readonly');
//     const store = tx.objectStore('pendingOrders');
//     return store.getAll();
//   }

//   async removePendingOrder(id) {
//     const tx = this.db.transaction('pendingOrders', 'readwrite');
//     const store = tx.objectStore('pendingOrders');
//     await store.delete(id);
//     return tx.complete;
//   }

//   // Wishlist
//   async addToWishlist(product) {
//     const tx = this.db.transaction('wishlist', 'readwrite');
//     const store = tx.objectStore('wishlist');
//     await store.put({ id: product._id, ...product });
//     return tx.complete;
//   }

//   async getWishlist() {
//     const tx = this.db.transaction('wishlist', 'readonly');
//     const store = tx.objectStore('wishlist');
//     return store.getAll();
//   }

//   async removeFromWishlist(id) {
//     const tx = this.db.transaction('wishlist', 'readwrite');
//     const store = tx.objectStore('wishlist');
//     await store.delete(id);
//     return tx.complete;
//   }

//   async isInWishlist(id) {
//     const tx = this.db.transaction('wishlist', 'readonly');
//     const store = tx.objectStore('wishlist');
//     const item = await store.get(id);
//     return !!item;
//   }
// }

// export const offlineDB = new OfflineDB();


