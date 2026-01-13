import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { toast } from "react-toastify";
import { supabase } from "../../libs/supabaseClient";

interface CartModalProps {
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CartModal({ setIsCartOpen }: CartModalProps) {
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!cartContext) return null;
  const { cart, removeFromCart, totalPrice } = cartContext;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user?.id) {
        toast.error("Please log in to book your order.");
        setIsCartOpen(false);
        navigate("/login", { state: { from: "/booking" } });
        return;
      }

      localStorage.setItem("currentBookingCart", JSON.stringify(cart));
      navigate("/booking");
      setIsCartOpen(false);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-[100]">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="relative w-80 bg-[#1A1A1A] h-full border-l border-[#2A2A2A] p-6 flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#D0C8B3]">Your Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="text-[#F1A7C5] hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-[#B8B1A0]">
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={String(item.id)} // Ensures key is always a string
                className="flex justify-between items-center bg-[#232323] p-4 rounded-lg border border-[#2A2A2A] hover:border-[#3A3A3A] transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-[#D0C8B3] leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-pink-400 mt-1">
                    ₱{item.price.toLocaleString()}{" "}
                    <span className="text-[#888]">× {item.quantity}</span>
                  </p>
                </div>
                <button
                  /* FIX: Explicitly cast to number if your context expects a number */
                  onClick={() => removeFromCart(Number(item.id))}
                  className="ml-4 text-[#F1A7C5] text-xs font-bold uppercase tracking-wider hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 border-t border-[#2A2A2A] pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[#888]">Subtotal</span>
            <span className="text-xl font-bold text-[#D0C8B3]">
              ₱{totalPrice().toLocaleString()}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className={`w-full py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 ${
              cart.length === 0 || loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-pink-600 text-white hover:bg-pink-700 active:scale-95 shadow-lg shadow-pink-900/20"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              "Proceed to Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
