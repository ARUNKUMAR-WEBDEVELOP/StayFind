import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FaHeart, FaUserCircle, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allHotels, setAllHotels] = useState([]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  // Fetch all hotels for autocomplete
  useEffect(() => {
    fetch(`${API_BASE}/api/hotels/`)
      .then((res) => res.json())
      .then((data) => setAllHotels(Array.isArray(data) ? data : []))
      .catch(() => setAllHotels([]));
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = searchInput.toLowerCase();
    const filtered = allHotels
      .filter((hotel) => {
        const title = (hotel.title || "").toLowerCase();
        const location = (hotel.location || "").toLowerCase();
        const place = (hotel.place || "").toLowerCase();
        return title.includes(query) || location.includes(query) || place.includes(query);
      })
      .slice(0, 5);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchInput, allHotels]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput.trim())}`);
      setShowSuggestions(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSuggestionClick = (hotel) => {
    navigate("/hotel-details", { state: hotel });
    setSearchInput("");
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => {
              navigate("/");
              setMobileMenuOpen(false);
            }}
          >
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 hidden sm:block">StayFind</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-center relative">
            <form onSubmit={handleSearch} className="relative w-full max-w-xl">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search hotels, locations..."
                className="hidden lg:block w-full border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                  {suggestions.map((hotel) => (
                    <button
                      key={hotel.id}
                      type="button"
                      onClick={() => handleSuggestionClick(hotel)}
                      className="w-full px-4 py-3 hover:bg-gray-50 text-left border-b last:border-b-0 transition"
                    >
                      <div className="font-medium text-gray-800 text-sm">{hotel.title}</div>
                      <div className="text-xs text-gray-500">{hotel.location} • {hotel.place}</div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Wishlist */}
                <button
                  onClick={() => navigate("/wishlist")}
                  className="p-2 hover:bg-red-50 rounded-full transition text-gray-600 hover:text-red-600"
                  title="Wishlist"
                >
                  <FaHeart size={20} />
                </button>

                {/* Cart */}
                <button
                  onClick={() => navigate("/mycart")}
                  className="p-2 hover:bg-green-50 rounded-full transition text-gray-600 hover:text-green-600"
                  title="Cart"
                >
                  <FaShoppingCart size={20} />
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3 border-l pl-4">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <FaUserCircle size={24} className="text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">
                    {user.name || user.email}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded-full text-sm transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center space-x-2 border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full transition text-sm font-medium"
              >
                <FaUserCircle size={18} />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white animate-slide-in-left">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search hotels..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                    {suggestions.map((hotel) => (
                      <button
                        key={hotel.id}
                        type="button"
                        onClick={() => handleSuggestionClick(hotel)}
                        className="w-full px-3 py-2 hover:bg-gray-50 text-left border-b last:border-b-0 text-sm"
                      >
                        <div className="font-medium text-gray-800">{hotel.title}</div>
                        <div className="text-xs text-gray-500">{hotel.location}</div>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 py-3 border-b">
                    {user.picture ? (
                      <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full" />
                    ) : (
                      <FaUserCircle size={28} className="text-gray-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{user.name || user.email}</p>
                    </div>
                  </div>

                  {/* Mobile Links */}
                  <button
                    onClick={() => {
                      navigate("/wishlist");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 p-3 hover:bg-red-50 rounded-lg transition text-left text-gray-700"
                  >
                    <FaHeart size={18} className="text-red-600" />
                    <span>Wishlist</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/mycart");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 p-3 hover:bg-green-50 rounded-lg transition text-left text-gray-700"
                  >
                    <FaShoppingCart size={18} className="text-green-600" />
                    <span>My Cart</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/account");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 p-3 hover:bg-blue-50 rounded-lg transition text-left text-gray-700"
                  >
                    <FaUserCircle size={18} className="text-blue-600" />
                    <span>My Account</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition font-medium"
                >
                  <FaUserCircle size={18} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
