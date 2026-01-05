import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineDB } from '../utils/offlineDB';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // ADD ITEM: Uses SKU to distinguish between variants
      addItem: async (product) => {
        const state = get();
        // Fallback: If product has no SKU, use ID (prevent crash)
        const itemKey = product.sku || product.id || product._id;
        
        // Safety: Ensure items is an array
        const currentItems = Array.isArray(state.items) ? state.items : [];

        const existingItem = currentItems.find((item) => (item.sku || item.id) === itemKey);
        
        let newItems;
        if (existingItem) {
          newItems = currentItems.map((item) =>
            (item.sku || item.id) === itemKey
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
        } else {
          newItems = [...currentItems, { 
            ...product, 
            sku: itemKey, // Ensure SKU exists
            quantity: product.quantity || 1 
          }];
        }
        
        set({ items: newItems });
        
        try {
          for (const item of newItems) {
            await offlineDB.saveCartItem(item);
          }
        } catch (error) {
          console.error('Error saving to offline DB:', error);
        }
      },

      // REMOVE ITEM
      removeItem: async (sku) => {
        const currentItems = get().items || [];
        const newItems = currentItems.filter((item) => (item.sku || item.id) !== sku);
        set({ items: newItems });
        
        try {
          await offlineDB.removeCartItem(sku);
        } catch (error) {
          console.error('Error removing from offline DB:', error);
        }
      },

      // UPDATE QUANTITY
      updateQuantity: async (sku, quantity) => {
        const currentItems = get().items || [];
        const newItems = currentItems.map((item) =>
          (item.sku || item.id) === sku ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        set({ items: newItems });
        
        try {
          const item = newItems.find(i => (i.sku || i.id) === sku);
          if (item) {
            await offlineDB.saveCartItem(item);
          }
        } catch (error) {
          console.error('Error updating in offline DB:', error);
        }
      },

      clearCart: async () => {
        set({ items: [] });
        try {
          await offlineDB.clearCart();
        } catch (error) {
          console.error('Error clearing offline DB:', error);
        }
      },

      getTotal: () => {
        const state = get();
        const currentItems = Array.isArray(state.items) ? state.items : [];
        return currentItems.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      syncFromOffline: async () => {
        try {
          const offlineItems = await offlineDB.getCartItems();
          // OG FIX: NEVER allow null. Default to empty array []
          set({ items: Array.isArray(offlineItems) ? offlineItems : [] });
        } catch (error) {
          console.error('Error syncing from offline DB:', error);
          set({ items: [] }); // Safety fallback
        }
      },
    }),
    {
      name: 'vesto-cart',
    }
  )
);

export default useCartStore;
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { offlineDB } from '../utils/offlineDB';

// const useCartStore = create(
//   persist(
//     (set, get) => ({
//       items: [],
      
//       // ADD ITEM (Now checks SKU)
//       addItem: async (product) => {
//         const state = get();
//         // Check if this exact VARIANT (SKU) is already in cart
//         const existingItem = state.items.find((item) => item.sku === product.sku);
        
//         let newItems;
//         if (existingItem) {
//           newItems = state.items.map((item) =>
//             item.sku === existingItem.sku
//               ? { ...item, quantity: item.quantity + (product.quantity || 1) }
//               : item
//           );
//         } else {
//           // Add new item (Ensure we have the SKU)
//           if (!product.sku) {
//             console.error("Attempted to add item without SKU:", product);
//             return;
//           }
//           newItems = [...state.items, { 
//             ...product, 
//             quantity: product.quantity || 1 
//           }];
//         }
        
//         set({ items: newItems });
        
//         // Sync to offline DB
//         try {
//           // We save the whole cart state or individual items? 
//           // Your offlineDB likely expects IDs. For now, we sync the list.
//           for (const item of newItems) {
//             await offlineDB.saveCartItem(item);
//           }
//         } catch (error) {
//           console.error('Error saving to offline DB:', error);
//         }
//       },

//       // REMOVE ITEM (By SKU)
//       removeItem: async (sku) => {
//         const newItems = get().items.filter((item) => item.sku !== sku);
//         set({ items: newItems });
        
//         try {
//           // Note: You might need to update offlineDB to delete by SKU if it uses ID keys
//           // For now, this handles the State logic
//           await offlineDB.removeCartItem(sku); 
//         } catch (error) {
//           console.error('Error removing from offline DB:', error);
//         }
//       },

//       // UPDATE QUANTITY (By SKU)
//       updateQuantity: async (sku, quantity) => {
//         const newItems = get().items.map((item) =>
//           item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item
//         );
//         set({ items: newItems });
        
//         try {
//           const item = newItems.find(i => i.sku === sku);
//           if (item) {
//             await offlineDB.saveCartItem(item);
//           }
//         } catch (error) {
//           console.error('Error updating in offline DB:', error);
//         }
//       },

//       clearCart: async () => {
//         set({ items: [] });
//         try {
//           await offlineDB.clearCart();
//         } catch (error) {
//           console.error('Error clearing offline DB:', error);
//         }
//       },

//       getTotal: () => {
//         const state = get();
//         return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
//       },

//       syncFromOffline: async () => {
//         try {
//           const offlineItems = await offlineDB.getCartItems();
//           set({ items: offlineItems });
//         } catch (error) {
//           console.error('Error syncing from offline DB:', error);
//         }
//       },
//     }),
//     {
//       name: 'vesto-cart', // Renamed from 'covera-cart'
//     }
//   )
// );

// export default useCartStore;