// src/context/CartContext.tsx
import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "../libs/supabaseClient";

export interface CartItem {
  id: number; // for component keys
  menu_item_id: number; // foreign key in DB
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (menu_item_id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch cart from Supabase when the component mounts
  useEffect(() => {
    const fetchCart = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      const user = userData?.user;
      if (userError || !user?.id) {
        setCart([]);
        return;
      }

      const { data, error } = await supabase
        .from("CartItems")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        setCart(
          data.map((d: any) => ({
            id: d.menu_item_id,
            menu_item_id: d.menu_item_id,
            name: d.name,
            price: Number(d.price),
            quantity: d.quantity,
          }))
        );
      }
    };

    fetchCart();
  }, []);

  const addToCart = async (item: CartItem) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user?.id) return;

    const existing = cart.find((i) => i.menu_item_id === item.menu_item_id);

    if (existing) {
      const { error } = await supabase
        .from("CartItems")
        .update({
          quantity: existing.quantity + item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("menu_item_id", item.menu_item_id);

      if (!error) {
        setCart((prev) =>
          prev.map((i) =>
            i.menu_item_id === item.menu_item_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        );
      }
    } else {
      const { error } = await supabase.from("CartItems").insert([
        {
          user_id: user.id,
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        },
      ]);

      if (!error) {
        setCart((prev) => [...prev, item]);
      }
    }
  };

  const removeFromCart = async (menu_item_id: number) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user?.id) return;

    const { error } = await supabase
      .from("CartItems")
      .delete()
      .eq("user_id", user.id)
      .eq("menu_item_id", menu_item_id);

    if (!error) {
      setCart((prev) => prev.filter((i) => i.menu_item_id !== menu_item_id));
    }
  };

  const clearCart = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user?.id) return;

    const { error } = await supabase
      .from("CartItems")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setCart([]);
    }
  };

  const totalPrice = () =>
    cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
