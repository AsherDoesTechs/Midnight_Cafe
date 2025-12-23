// Header.tsx (Guest-safe version)

import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { animateScroll as scroll, scroller } from "react-scroll";
import Logo from "../../img/Logo.png";
import { useCart } from "../../context/CartContext";
import { FaUserAlt, FaShoppingCart } from "react-icons/fa";
import { Settings } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

interface NavItem {
  name: string;
  to: string;
  scrollTo?: string;
}

interface HeaderProps {
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const navItems: NavItem[] = [
  { name: "Home", to: "/", scrollTo: "hero" },
  { name: "Menu", to: "/menu" },
  { name: "Booking", to: "/booking" },
  { name: "Contact", to: "/contact" },
];

const Header = forwardRef<HTMLDivElement, HeaderProps>(
  ({ setIsCartOpen }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const { user, isLoading, logout } = useAuth();
    const { cart } = useCart();

    const location = useLocation();
    const navigate = useNavigate();

    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(e.target as Node)
        ) {
          setIsUserMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const hideHeaderPaths = ["/admin", "/admin-login"];
    const shouldHideHeader = hideHeaderPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    if (shouldHideHeader || isLoading) {
      return null;
    }

    const handleLogout = async () => {
      await logout("/login");
      setIsUserMenuOpen(false);
      navigate("/login");
    };

    const handleNavClick = (item: NavItem) => {
      setIsMobileMenuOpen(false);
      if (location.pathname === "/" && item.scrollTo) {
        scroller.scrollTo(item.scrollTo, {
          smooth: true,
          duration: 500,
          offset: -80,
        });
      } else {
        navigate(item.to, { state: { scrollToId: item.scrollTo } });
      }
    };

    const handleLogoClick = () => {
      if (location.pathname === "/") scroll.scrollToTop({ duration: 500 });
      else navigate("/");
    };

    const isActive = (item: NavItem) =>
      (item.to === "/" && location.pathname === "/") ||
      (item.to !== "/" && location.pathname.startsWith(item.to))
        ? "text-[#F1A7C5]"
        : "text-[#D0C8B3]";

    const getUserDisplay = () => {
      if (!user) return "";
      if (user.role === "guest")
        return user.displayName || `Guest (ID: ${user.id})`;
      return user.displayName || user.email;
    };

    const userName = getUserDisplay();

    return (
      <header
        ref={ref}
        className="fixed top-0 w-full z-[50] bg-[#121212]/90 backdrop-blur-md border-b border-[#2A2A2A] shadow-lg"
      >
        <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* LOGO */}
          <button onClick={handleLogoClick} className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-semibold text-[#D0C8B3]">
              Midnight Cafe
            </span>
          </button>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                className={`text-lg ${isActive(
                  item
                )} hover:text-[#F1A7C5] transition-all hover:scale-110`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* CART + USER */}
          <div className="relative flex items-center gap-6">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative text-2xl hover:text-[#F1A7C5] transition"
            >
              <FaShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F1A7C5] text-black rounded-full px-2 text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* USER MENU */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="rounded-full w-10 h-10 bg-[#F1A7C5] flex items-center justify-center text-[#121212] hover:scale-105 transition"
                >
                  <FaUserAlt size={20} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#232323] border border-[#2A2A2A] rounded-lg shadow-md z-[100]">
                    <p className="px-3 py-2 text-[#D0C8B3] font-semibold text-center truncate border-b border-[#2A2A2A]">
                      {userName}
                    </p>

                    {/* Only show Account Dashboard if user is NOT guest */}
                    {user.role !== "guest" && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/user");
                        }}
                        className="w-full text-left flex items-center px-3 py-2 hover:bg-[#2A2A2A]"
                      >
                        <Settings className="text-[#F1A7C5] mr-2" size={16} />
                        <span className="text-[#D0C8B3]">
                          Account Dashboard
                        </span>
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 bg-[#F1A7C5] text-[#121212] rounded-b hover:bg-[#f3b3cd] transition text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="rounded-full w-10 h-10 bg-[#D0C8B3] flex items-center justify-center text-[#121212] hover:scale-105 transition"
              >
                <FaUserAlt size={20} />
              </button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center">
            <button
              className="text-[#D0C8B3] text-3xl"
              onClick={() => setIsMobileMenuOpen((p) => !p)}
            >
              ☰
            </button>
          </div>
        </nav>

        {/* MOBILE MENU PANEL */}
        <div
          className={`absolute top-0 right-0 h-screen w-full bg-[#121212] text-[#D0C8B3] z-[40] transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#F1A7C5] text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col items-center mt-8 gap-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                className={`text-xl ${isActive(
                  item
                )} hover:text-[#F1A7C5] transition-all`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
export default Header;
