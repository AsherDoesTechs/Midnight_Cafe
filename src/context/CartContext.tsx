import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { supabase } from "../libs/supabaseClient";

export interface CartItem {
  id: string;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  removeFromCart: (menu_item_id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalPrice: () => number;
}

// Internal interface for DB mapping
interface DBCartItem {
  id: string;
  menu_item_id: number;
  name: string;
  price: string | number;
  quantity: number;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = async (userId: string) => {
      const { data, error } = await supabase
        .from("cartitems")
        .select("*")
        .eq("user_id", userId);

      if (!error && data) {
        setCart(
          (data as DBCartItem[]).map((d) => ({
            id: d.id,
            menu_item_id: d.menu_item_id,
            name: d.name,
            price: Number(d.price),
            quantity: d.quantity,
          }))
        );
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadCart(session.user.id);
        } else {
          setCart([]);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const addToCart = async (item: Omit<CartItem, "id">) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const existing = cart.find((i) => i.menu_item_id === item.menu_item_id);
    const quantity = existing
      ? existing.quantity + item.quantity
      : item.quantity;

    const { data, error } = await supabase
      .from("cartitems")
      .upsert(
        {
          user_id: user.id,
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,menu_item_id" }
      )
      .select()
      .single();

    if (!error && data) {
      setCart((prev) => {
        const filtered = prev.filter(
          (i) => i.menu_item_id !== item.menu_item_id
        );
        return [
          ...filtered,
          {
            id: data.id,
            menu_item_id: data.menu_item_id,
            name: data.name,
            price: Number(data.price),
            quantity: data.quantity,
          },
        ];
      });
    }
  };

  const removeFromCart = async (menu_item_id: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase
      .from("cartitems")
      .delete()
      .eq("user_id", user.id)
      .eq("menu_item_id", menu_item_id);

    if (!error) {
      setCart((prev) => prev.filter((i) => i.menu_item_id !== menu_item_id));
    }
  };

  const clearCart = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const { error } = await supabase
      .from("cartitems")
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
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
