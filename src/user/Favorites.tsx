import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { Heart, ShoppingCart, Trash2, Tag, Minus, Plus } from "lucide-react";
import { supabase } from "../libs/supabaseClient";

interface FavoriteItem {
  id: number; // menu_item_id
  name: string;
  price: number;
  category: string;
}

interface FavoriteCardProps {
  item: FavoriteItem;
  handleAddToCart: (item: FavoriteItem, quantity: number) => void;
  handleRemoveFavorite: (item: FavoriteItem) => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({
  item,
  handleAddToCart,
  handleRemoveFavorite,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity((prev) => prev + 1);

  const onAddToCart = () => {
    setIsAdding(true);
    handleAddToCart(item, quantity);
    setTimeout(() => {
      setQuantity(1);
      setIsAdding(false);
    }, 500);
  };

  const isButtonDisabled = isAdding || quantity < 1;

  return (
    <div
      key={item.id}
      className="bg-[#222] p-5 rounded-lg border border-[#333] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center transition-all hover:border-[#F1A7C5]"
    >
      <div className="space-y-1 mb-3 md:mb-0">
        <p className="text-lg font-bold text-white">{item.name}</p>
        <div className="flex items-center text-sm text-gray-400 gap-4">
          <span className="flex items-center gap-1">
            <Tag size={14} className="text-[#F1A7C5]" /> {item.category}
          </span>
          <span className="text-[#F1A7C5] font-semibold">
            ₱{item.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 p-1 bg-[#333] rounded-lg">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className={`p-1 rounded-full transition ${
              quantity <= 1
                ? "text-gray-500 cursor-not-allowed"
                : "text-[#F1A7C5] hover:bg-[#444]"
            }`}
          >
            <Minus size={16} />
          </button>
          <span className="text-sm font-bold w-4 text-center text-white">
            {quantity}
          </span>
          <button
            onClick={increaseQuantity}
            className="p-1 rounded-full transition text-[#F1A7C5] hover:bg-[#444]"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={onAddToCart}
          disabled={isButtonDisabled}
          className={`transition flex items-center gap-1 font-medium text-sm p-2 rounded-lg ${
            isButtonDisabled
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isAdding ? (
            `Adding...`
          ) : (
            <>
              Add {quantity} <ShoppingCart size={18} />
            </>
          )}
        </button>

        <button
          onClick={() => handleRemoveFavorite(item)}
          className="text-red-500 hover:text-red-400 transition p-2 rounded-lg hover:bg-[#333]"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const Favorites: React.FC = () => {
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Fetch favorites from Supabase
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const user = supabase.auth.user();
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("menu_items(id, name, price, category)")
        .eq("user_id", user.id);

      if (error) throw error;

      const transformedData: FavoriteItem[] = (data || []).map((fav: any) => ({
        id: fav.menu_items.id,
        name: fav.menu_items.name,
        price: fav.menu_items.price,
        category: fav.menu_items.category,
      }));

      setFavorites(transformedData);
    } catch (err) {
      console.error("❌ Error fetching favorites:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (itemToRemove: FavoriteItem) => {
    setFavorites((prev) => prev.filter((i) => i.id !== itemToRemove.id));

    try {
      const user = supabase.auth.user();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("menu_item_id", itemToRemove.id);

      if (error) {
        setFavorites((prev) => [...prev, itemToRemove]); // revert
        throw error;
      }

      showToast(`💔 Removed ${itemToRemove.name} from favorites.`);
    } catch (err) {
      console.error("Error removing favorite:", err);
      fetchFavorites(); // ensure sync
    }
  };

  const handleAddToCart = useCallback(
    (item: FavoriteItem, quantity: number) => {
      addToCart({ id: item.id, name: item.name, price: item.price, quantity });
      showToast(`🛒 Added ${quantity}x ${item.name} to cart!`);
    },
    [addToCart]
  );

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <h3 className="text-2xl font-semibold mb-4 text-[#F1A7C5] flex items-center gap-2">
          <Heart size={24} /> My Saved Favorites
        </h3>
        <div className="text-center py-10 bg-[#222] rounded-lg border border-[#333] animate-pulse">
          <p className="text-lg font-medium text-gray-400">
            Loading your favorites...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-2xl font-semibold mb-4 text-[#F1A7C5] flex items-center gap-2">
        <Heart size={24} /> My Saved Favorites
      </h3>

      {favorites.length === 0 ? (
        <div className="text-center p-10 bg-[#222] rounded-lg border border-[#333]">
          <p className="text-lg font-medium">
            You haven't saved any items yet.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Click the heart icon on a menu item to save it here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((item) => (
            <FavoriteCard
              key={item.id}
              item={item}
              handleAddToCart={handleAddToCart}
              handleRemoveFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}

      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 transform ${
          toast.visible
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="bg-green-600 text-white p-4 rounded-lg shadow-xl font-medium text-sm border border-green-700">
          {toast.message}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
