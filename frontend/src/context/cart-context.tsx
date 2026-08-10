'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { CartItem, Product } from '@/types';

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoaded: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, sizeId?: string, quantity?: number) => void;
  removeItem: (productId: string, sizeId?: string) => void;
  updateQuantity: (productId: string, sizeId?: string, quantity?: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ef_cart_items_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (product: Product, sizeId?: string, quantity = 1) => {
    const validQty = Math.max(1, Math.min(99, quantity));
    const selectedSizeObj = sizeId
      ? product.productSizes?.find((ps) => ps.sizeId === sizeId)?.size
      : undefined;

    setItems((prev) => {
      const index = prev.findIndex(
        (item) => item.productId === product.id && item.sizeId === sizeId,
      );

      if (index > -1) {
        const updated = [...prev];
        const newQty = Math.min(99, updated[index].quantity + validQty);
        updated[index] = { ...updated[index], quantity: newQty };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          product,
          sizeId,
          sizeName: selectedSizeObj?.name,
          quantity: validQty,
        },
      ];
    });

    openCart();
  };

  const removeItem = (productId: string, sizeId?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.sizeId === sizeId),
      ),
    );
  };

  const updateQuantity = (
    productId: string,
    sizeId?: string,
    quantity = 1,
  ) => {
    if (quantity <= 0) {
      removeItem(productId, sizeId);
      return;
    }

    const validQty = Math.min(99, quantity);

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.sizeId === sizeId) {
          return { ...item, quantity: validQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const priceNum = typeof item.product.price === 'string'
      ? parseFloat(item.product.price)
      : item.product.price;
    return sum + (isNaN(priceNum) ? 0 : priceNum) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoaded,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
