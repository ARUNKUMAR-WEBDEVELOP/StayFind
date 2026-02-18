// src/component/Wishlist.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../common/Toast";
import Navbar from "./Navbar";
import { FaStar, FaMapMarkerAlt, FaShoppingCart, FaChevronRight, FaTrash } from "react-icons/fa";

export const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://stayfind.onrender.com/api/wishlist/view/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then((data) => {
        setWishlist(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to load wishlist", "error");
        setLoading(false);
      });
  }, [token, navigate]);

  const addToCart = async (hotel) => {
    try {
      const res = await fetch("https://stayfind.onrender.com/api/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hotel_id: hotel.id }),
      });

      if (!res.ok) throw new Error("Failed");
      showToast("✓ Added to cart", "success");
    } catch (err) {
      showToast("Failed to add to cart", "error");
    }
  };

  const removeFromWishlist = async (hotelId) => {
    setRemoving(hotelId);
    try {
      const res = await fetch(`https://stayfind.onrender.com/api/wishlist/${hotelId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setWishlist(wishlist.filter((hotel) => hotel.id !== hotelId));
        showToast("Removed from wishlist", "success");
      } else {
        showToast("Failed to remove", "error");
      }
    } catch (err) {
      showToast("Error removing from wishlist", "error");
    } finally {
      setRemoving(null);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Your Wishlist</h1>
          <p className="text-gray-600">
            {wishlist.length === 0 ? "Start adding hotels to your wishlist" : `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">No items in your wishlist yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Explore Hotels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden group">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                    onClick={() => navigate("/hotel-details", { state: hotel })}
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ❤️ Saved
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{hotel.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                    <FaMapMarkerAlt className="text-red-500" /> {hotel.location}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">₹{hotel.price.toLocaleString()}</span>
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold">
                      <FaStar size={14} /> {hotel.rating}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate("/hotel-details", { state: hotel })}
                      className="flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-2 rounded-lg font-semibold transition text-xs"
                    >
                      <FaChevronRight size={12} /> View
                    </button>
                    <button
                      onClick={() => addToCart(hotel)}
                      className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-lg font-semibold transition text-xs"
                    >
                      <FaShoppingCart size={12} /> Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(hotel.id)}
                      disabled={removing === hotel.id}
                      className="flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-2 py-2 rounded-lg font-semibold transition text-xs disabled:opacity-50"
                    >
                      <FaTrash size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
