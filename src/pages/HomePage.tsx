import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import { toast } from "react-toastify";
import Header from "./components/Header";
import { Coffee, Croissant, MessageCircle, Star, Clock } from "lucide-react";
import cappucinoImage from "../assets/foods/Cappuccino_2.png";
import croissantImage from "../assets/foods/Chocolate_Croissant2.png";
import tiramisuImage from "../assets/foods/tiramisu2.png";
import Background1 from "../assets/Images/Bg_1.png";
import Background2 from "../assets/Images/Bg_2.png";

// Helper component for featured menu items
interface FeaturedItemProps {
  name: string;
  description: string;
  price: string;
  imgUrl: string;
  delay: string;
}

const FeaturedItem: React.FC<FeaturedItemProps> = ({
  name,
  description,
  price,
  imgUrl,
  delay,
}) => (
  <div
    className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 text-left shadow-2xl
              transition-all duration-500 hover:border-[#F1A7C5] hover:shadow-[0_0_20px_rgba(241,167,197,0.3)]
              animate-fadeIn"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-4 mb-4">
      <img
        src={imgUrl}
        alt={name}
        className="w-16 h-16 rounded-full object-cover border-2 border-[#F1A7C5]/50"
      />
      <h3 className="text-2xl font-bold text-[#F1A7C5]">{name}</h3>
    </div>

    <p className="mt-2 text-[#A4A19A] text-sm leading-relaxed">{description}</p>

    <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex justify-between items-center">
      <span className="text-xl font-extrabold text-[#D0C8B3]">{price}</span>
      <a href="/booking">
        <button className="text-sm bg-[#F1A7C5] text-[#121212] py-1 px-3 rounded-full font-semibold hover:bg-[#f3b3cd] transition-colors">
          Reserve Spot
        </button>
      </a>
    </div>
  </div>
);

// --- HARDCODED FEATURED ITEMS (Your Selection) ---
const featuredItems: FeaturedItemProps[] = [
  {
    name: "Cappuccino",
    description: "Foamy espresso perfection, the cave explorer's fuel.",
    price: "₱120.00",
    imgUrl: cappucinoImage,
    delay: "0.2s",
  },
  {
    name: "Chocolate Croissant",
    description: "Flaky, buttery pastry perfect for a pre-tour snack.",
    price: "₱105.00",
    imgUrl: croissantImage,
    delay: "0.4s",
  },
  {
    name: "Tiramisu Cup",
    description:
      "Coffee-flavored Italian dessert, a rich treat after descending.",
    price: "₱160.00",
    imgUrl: tiramisuImage,
    delay: "0.6s",
  },
];
// ------------------------------------------------

export default function HomePage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [sparklePositions, setSparklePositions] = useState<number[][]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // --- useEffect for Scroll Behavior Only (Data fetching removed) ---
  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // ------------------------------------------------------------------

  // Handle scroll to anchor between pages (unchanged)
  useEffect(() => {
    const scrollToId = location.state?.scrollToId;
    if (scrollToId) {
      scroller.scrollTo(scrollToId, {
        smooth: true,
        duration: 500,
        offset: -80,
      });
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleBackToTop = () => {
    scroller.scrollTo("hero", {
      smooth: true,
      duration: 500,
      offset: -80,
    });
  };

  const getRandomPosition = () => [
    Math.random() * 60 + 10,
    Math.random() * 60 + 10,
  ];

  const handleSecretAdminClick = () => {
    setSecretClicks((prev) => prev + 1);
    setSparklePositions((prev) => [...prev, getRandomPosition()]);

    if (secretClicks + 1 >= 3) {
      setSecretClicks(0);
      toast.info("Admin access unlocked!", { autoClose: 2000 });
      setTimeout(() => navigate("/admin-login"), 2100);
    }
  };

  // --- Replaced renderFeaturedContent with simple map ---
  const renderFeaturedContent = () => {
    return featuredItems.map((item, index) => (
      <FeaturedItem key={index} {...item} />
    ));
  };

  return (
    <div className="w-full min-h-screen text-[#D0C8B3] bg-[#121212] relative overflow-hidden">
      <Header setIsCartOpen={setIsCartOpen} />

      {/* Hero Section */}
      <section
        id="hero"
        className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center mt-20 relative"
      >
        <div className="relative p-4 md:p-0">
          <h1 className="text-6xl md:text-6xl font-extrabold leading-snug tracking-tighter text-[#D0C8B3] drop-shadow-lg">
            Midnight Cafe
          </h1>

          <h2 className="text-3xl font-light text-[#F1A7C5] mb-6">
            A Hidden Sanctuary of Nature
          </h2>

          <p className="mt-6 text-xl text-[#B8B1A0] max-w-md leading-relaxed">
            Descend into the cool, silent depths of Midnight Cafe. Witness the
            natural splendor of geological formations and the breathtaking
            flight of its resident bat colony. An experience for the adventurous
            soul.
          </p>

          {/* Hours Bar */}
          <div className="mt-8 mb-10 w-full">
            <div className="flex items-center gap-2 p-3 bg-[#1A1A1A]/70 border border-[#2A2A2A] rounded-lg shadow-md">
              <Clock size={18} className="text-[#F1A7C5]" />
              <p className="text-sm text-[#B8B1A0] tracking-wide">
                First guided tour begins at
                <span className="text-[#F1A7C5] font-extrabold ml-1">
                  1:00 PM
                </span>
                daily. Closing time is 1:00 AM.
              </p>
            </div>
          </div>

          <Link
            to="/menu"
            className="inline-block mt-8 px-10 py-4 rounded-full border-2 border-[#D0C8B3]
            text-[#D0C8B3] text-lg font-semibold hover:bg-[#F1A7C5] hover:text-[#121212] transform hover:scale-105"
          >
            Explore the Tours
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full h-96 md:h-[550px] rounded-2xl overflow-hidden shadow-xl border border-[#2A2A2A] relative">
          <img
            src={Background1}
            alt="Cave interior, moody and dark"
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#F1A7C5]/10"></div>
        </div>
      </section>

      {/* Featured Section - NOW USES HARDCODED ITEMS */}
      <section
        id="menu"
        className="py-28 mt-10 border-t border-b border-[#2A2A2A] bg-[#1A1A1A]"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Star className="w-8 h-8 text-[#F1A7C5] mx-auto mb-4 animate-pulse" />
          <h2 className="text-5xl font-extrabold text-[#D0C8B3]">
            Essential Expeditions & Highlights
          </h2>
          <p className="mt-4 text-xl text-[#B8B1A0] max-w-2xl mx-auto">
            Discover the most popular ways to explore the wonders hidden within
            the Midnight Cafe. Each tour is designed to immerse you in the
            cave's natural beauty and unique ecosystem.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {renderFeaturedContent()} {/* Render hardcoded content */}
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 mt-16 px-12 py-4 rounded-full border-2 border-[#F1A7C5]
              text-[#F1A7C5] font-extrabold text-lg hover:bg-[#F1A7C5] hover:text-[#121212] transform hover:scale-105"
          >
            <Coffee className="w-5 h-5" /> View All Cave Tours
          </Link>
        </div>
      </section>

      {/* About Section (unchanged text) */}
      <section id="about" className="py-28">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="w-full h-96 md:h-[30rem] overflow-hidden rounded-2xl shadow-2xl relative">
            <img
              src={Background2}
              alt="Coffee beans and brewing"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/50 to-transparent"></div>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-extrabold text-[#D0C8B3]">
              The Cave's Legacy
            </h2>

            <p className="text-xl text-[#B8B1A0] leading-relaxed">
              Formed over millennia, the Midnight Cafe is not just a landmark;
              it is a critical ecosystem and a silent witness to history. Our
              commitment is to preserve its natural state for generations to
              come.
            </p>

            <div className="flex flex-wrap gap-6 pt-4 border-t border-[#2A2A2A]">
              <StatCard
                icon={<Coffee size={32} className="text-[#F1A7C5]" />}
                value="20k+"
                label="Resident Bats"
              />
              <StatCard
                icon={<Croissant size={32} className="text-[#F1A7C5]" />}
                value="5M+"
                label="Years of Formation"
              />
              <StatCard
                icon={<MessageCircle size={32} className="text-[#F1A7C5]" />}
                value="Trained"
                label="Local Guides"
              />
            </div>

            <Link
              to="/contact"
              className="inline-block mt-8 px-10 py-4 rounded-full border-2 border-[#D0C8B3]
                text-[#D0C8B3] text-lg font-semibold hover:bg-[#F1A7C5] hover:text-[#121212] transform hover:scale-105"
            >
              Contact the Explorers
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={handleBackToTop}
          className="fixed bottom-10 right-10 bg-[#F1A7C5] text-[#121212] rounded-full p-4 shadow-lg hover:bg-[#F1A7C5]/90 transition-all z-40"
        >
          ↑
        </button>
      )}

      {/* Secret Admin Easter Egg */}
      <div
        onClick={handleSecretAdminClick}
        className="fixed bottom-4 left-4 w-6 h-6 cursor-pointer opacity-0 z-50"
      >
        {sparklePositions.map(([x, y], idx) => (
          <div
            key={idx}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
            style={{ left: x, top: y }}
          />
        ))}
      </div>
    </div>
  );
}

// Stat Card Component (unchanged)
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="flex items-center gap-4 bg-[#1A1A1A]/70 p-4 rounded-xl border border-[#2A2A2A] w-52">
    {icon}
    <div>
      <span className="text-3xl font-extrabold text-[#F1A7C5] block">
        {value}
      </span>
      <span className="text-[#B8B1A0] text-sm">{label}</span>
    </div>
  </div>
);
