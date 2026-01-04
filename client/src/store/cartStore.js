import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineDB } from '../utils/offlineDB';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // ADD ITEM: Uses SKU to distinguish between "Red Size 40" and "Blue Size 40"
      addItem: async (product) => {
        const state = get();
        
        // LEARNING MOMENT: We check for SKU (Variant ID), not just Product ID
        const existingItem = state.items.find((item) => item.sku === product.sku);
        
        let newItems;
        if (existingItem) {
          // If SKU matches, just increase quantity
          newItems = state.items.map((item) =>
            item.sku === existingItem.sku
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
        } else {
          // New SKU? Add it to the list
          newItems = [...state.items, { 
            ...product, 
            quantity: product.quantity || 1 
          }];
        }
        
        set({ items: newItems });
        
        // Sync to offline DB (Best effort)
        try {
          for (const item of newItems) {
            await offlineDB.saveCartItem(item); // Ensure offlineDB supports SKU as key if needed
          }
        } catch (error) {
          console.error('Error saving to offline DB:', error);
        }
      },

      // REMOVE ITEM: Must remove by SKU
      removeItem: async (sku) => {
        const newItems = get().items.filter((item) => item.sku !== sku);
        set({ items: newItems });
        
        try {
          await offlineDB.removeCartItem(sku);
        } catch (error) {
          console.error('Error removing from offline DB:', error);
        }
      },

      // UPDATE QUANTITY: Must identify by SKU
      updateQuantity: async (sku, quantity) => {
        const newItems = get().items.map((item) =>
          item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        set({ items: newItems });
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
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      syncFromOffline: async () => {
        try {
          const offlineItems = await offlineDB.getCartItems();
          set({ items: offlineItems });
        } catch (error) {
          console.error('Error syncing from offline DB:', error);
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