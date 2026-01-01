import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineDB } from '../utils/offlineDB';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // ADD ITEM (Now checks SKU)
      addItem: async (product) => {
        const state = get();
        // Check if this exact VARIANT (SKU) is already in cart
        const existingItem = state.items.find((item) => item.sku === product.sku);
        
        let newItems;
        if (existingItem) {
          newItems = state.items.map((item) =>
            item.sku === existingItem.sku
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
        } else {
          // Add new item (Ensure we have the SKU)
          if (!product.sku) {
            console.error("Attempted to add item without SKU:", product);
            return;
          }
          newItems = [...state.items, { 
            ...product, 
            quantity: product.quantity || 1 
          }];
        }
        
        set({ items: newItems });
        
        // Sync to offline DB
        try {
          // We save the whole cart state or individual items? 
          // Your offlineDB likely expects IDs. For now, we sync the list.
          for (const item of newItems) {
            await offlineDB.saveCartItem(item);
          }
        } catch (error) {
          console.error('Error saving to offline DB:', error);
        }
      },

      // REMOVE ITEM (By SKU)
      removeItem: async (sku) => {
        const newItems = get().items.filter((item) => item.sku !== sku);
        set({ items: newItems });
        
        try {
          // Note: You might need to update offlineDB to delete by SKU if it uses ID keys
          // For now, this handles the State logic
          await offlineDB.removeCartItem(sku); 
        } catch (error) {
          console.error('Error removing from offline DB:', error);
        }
      },

      // UPDATE QUANTITY (By SKU)
      updateQuantity: async (sku, quantity) => {
        const newItems = get().items.map((item) =>
          item.sku === sku ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        set({ items: newItems });
        
        try {
          const item = newItems.find(i => i.sku === sku);
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
      name: 'vesto-cart', // Renamed from 'covera-cart'
    }
  )
);

export default useCartStore;