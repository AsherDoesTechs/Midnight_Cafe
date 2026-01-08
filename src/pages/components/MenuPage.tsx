import { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../libs/supabaseClient";
import { Heart, ShoppingCart, Clock, Ban, Minus, Plus } from "lucide-react";

// --- TYPES ---
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  diet: string[];
  status: "available" | "archived" | "coming-soon" | "out-of-stock";
}

// --- MENU CARD COMPONENT ---
interface MenuCardProps {
  item: MenuItem;
  handleAddToCart: (item: MenuItem, quantity: number) => void;
  toggleWishlist: (id: number) => void;
  isWishlisted: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  handleAddToCart,
  toggleWishlist,
  isWishlisted,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLocked, setActionLocked] = useState(false);

  const showToast = (message: string) => {
    setActionLocked(true);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
      setActionLocked(false);
    }, 2000);
  };

  const isAvailable = item.status === "available";
  const isComingSoon = item.status === "coming-soon";
  const isOutOfStock = item.status === "out-of-stock";

  let statusLabel = "";
  let statusClass = "";
  let buttonText = "Add to Cart";
  let buttonDisabled = false;
  let icon = <ShoppingCart size={18} />;

  if (isComingSoon) {
    statusLabel = "Will be soon launched!";
    statusClass = "bg-yellow-600/80 text-white";
    buttonText = "Coming Soon";
    buttonDisabled = true;
    icon = <Clock size={18} />;
  } else if (isOutOfStock) {
    statusLabel = "Out of Stock";
    statusClass = "bg-red-600/80 text-white";
    buttonText = "Out of Stock";
    buttonDisabled = true;
    icon = <Ban size={18} />;
  }

  const handleCartClick = () => {
    if (!actionLocked && isAvailable && quantity > 0) {
      handleAddToCart(item, quantity);
      showToast(`Added ${quantity} to Cart`);
      setQuantity(1);
    }
  };

  const handleWishlistClick = () => {
    if (!actionLocked) {
      toggleWishlist(item.id);
      showToast(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-[#333] relative overflow-hidden">
      <div className="relative h-48">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full object-cover ${
            !isAvailable ? "opacity-50 grayscale" : ""
          }`}
        />
        {(isComingSoon || isOutOfStock) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span
              className={`text-sm font-bold px-4 py-2 rounded-full shadow-lg ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
        )}

        <button
          onClick={handleWishlistClick}
          disabled={actionLocked}
          className={`absolute top-3 right-3 p-2 rounded-full transition z-10 ${
            isWishlisted
              ? "text-red-500 bg-white"
              : "text-[#D0C8B3] bg-black/60 hover:bg-black/90"
          }`}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {toastMessage && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-green-600/90 text-white text-sm py-2 px-4 rounded-lg shadow-2xl font-bold animate-bounce">
              {toastMessage.includes("Wishlist")
                ? `❤️ ${toastMessage}`
                : `🛒 ${toastMessage}`}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-xl font-bold text-white mb-1">{item.name}</h4>
        <p className="text-pink-400 font-semibold mb-2">
          ₱{item.price.toFixed(2)}
        </p>
        <p className="text-sm text-[#888] mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {/* The ?. prevents the crash if diet is undefined or null */}
          {item.diet?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-800/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {isAvailable && (
          <div className="flex items-center justify-between gap-4 mb-4 p-2 bg-[#252525] rounded-lg border border-[#3A3A3A]">
            <span className="text-xs text-[#D0C8B3]">Quantity:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 rounded-md bg-[#333] text-pink-400 hover:bg-[#444]"
              >
                <Minus size={16} />
              </button>
              <span className="text-md font-bold text-white w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1 rounded-md bg-[#333] text-pink-400 hover:bg-[#444]"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCartClick}
          disabled={buttonDisabled || actionLocked}
          className={`w-full flex justify-center items-center gap-2 py-2.5 rounded-lg font-bold transition ${
            isAvailable && !actionLocked
              ? "bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-900/20"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          {icon} {buttonText}
        </button>
      </div>
    </div>
  );
};

// --- MAIN MENU PAGE ---
export default function MenuPage() {
  const { addToCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Note: Ensure the table name in Supabase is 'menu_items' (lowercase) per our SQL script
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) throw error;
      setMenuItems((data as MenuItem[]) ?? []);
    } catch (err) {
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_favorites")
        .select("menu_item_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setWishlist(data?.map((d) => d.menu_item_id) ?? []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
    fetchWishlist();
  }, [fetchMenu, fetchWishlist]);

  const toggleWishlist = useCallback(
    async (id: number) => {
      if (isWishlistLoading) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Please log in to save favorites!");
        return;
      }

      setIsWishlistLoading(true);
      const isCurrentlyWishlisted = wishlist.includes(id);

      // Optimistic Update
      setWishlist((prev) =>
        isCurrentlyWishlisted
          ? prev.filter((item) => item !== id)
          : [...prev, id]
      );

      try {
        if (isCurrentlyWishlisted) {
          await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("menu_item_id", id);
        } else {
          await supabase
            .from("user_favorites")
            .insert({ user_id: user.id, menu_item_id: id });
        }
      } catch (err) {
        console.error("Wishlist sync error:", err);
        // Revert on error
        fetchWishlist();
      } finally {
        setIsWishlistLoading(false);
      }
    },
    [wishlist, isWishlistLoading, fetchWishlist]
  );

  const handleAddToCart = (item: MenuItem, quantity: number) => {
    // We include both 'id' and 'menu_item_id' to satisfy the CartItem type
    // and ensure the Context has the database key it needs.
    addToCart({
      id: item.id,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity,
    });
  };

  const filteredMenu = useMemo(() => {
    return menuItems
      .filter(
        (item) => item.status !== "archived" && item.status !== "coming-soon"
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [menuItems]);

  const comingSoonItems = useMemo(
    () => menuItems.filter((item) => item.status === "coming-soon"),
    [menuItems]
  );

  return (
    <div className="min-h-screen bg-[#121212] text-[#D0C8B3] pt-24 pb-16">
      <main className="max-w-7xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Our Menu</h1>
          <p className="text-gray-500">
            Handcrafted treats and specialized brews.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMenu.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                handleAddToCart={handleAddToCart}
                toggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(item.id)}
              />
            ))}
          </div>
        )}

        {comingSoonItems.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#2A2A2A]">
            <h2 className="text-2xl font-bold text-yellow-500 mb-8 flex items-center gap-3">
              <Clock size={28} /> Coming Soon to Malvar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comingSoonItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  handleAddToCart={handleAddToCart}
                  toggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(item.id)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
