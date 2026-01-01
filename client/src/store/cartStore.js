import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { offlineDB } from '../utils/offlineDB';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (product) => {
        const state = get();
        const existingItem = state.items.find((item) => item.id === product._id || item.id === product.id);
        
        let newItems;
        if (existingItem) {
          newItems = state.items.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item
          );
        } else {
          newItems = [...state.items, { 
            id: product._id || product.id, 
            ...product, 
            quantity: product.quantity || 1 
          }];
        }
        
        set({ items: newItems });
        
        // Sync to offline DB
        try {
          for (const item of newItems) {
            await offlineDB.saveCartItem(item);
          }
        } catch (error) {
          console.error('Error saving to offline DB:', error);
        }
      },
      removeItem: async (productId) => {
        const newItems = get().items.filter((item) => item.id !== productId);
        set({ items: newItems });
        
        try {
          await offlineDB.removeCartItem(productId);
        } catch (error) {
          console.error('Error removing from offline DB:', error);
        }
      },
      updateQuantity: async (productId, quantity) => {
        const newItems = get().items.map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        set({ items: newItems });
        
        try {
          const item = newItems.find(i => i.id === productId);
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
      name: 'vesto-cart',
    }
  )
);

export default useCartStore;

