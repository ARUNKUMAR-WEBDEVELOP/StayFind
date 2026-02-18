// src/component/auth/Mycart.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Toast from "../common/Toast";
import { FaStar, FaMapMarkerAlt, FaChevronRight, FaBookOpen, FaTrash } from "react-icons/fa";

export const MyCart = () => {
  const [cart, setCart] = useState([]);
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

    setLoading(true);
    fetch("https://stayfind.onrender.com/api/cart/view/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then((data) => {
        setCart(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to load cart", "error");
        setLoading(false);
      });
  }, [token, navigate]);

  const handleRemoveFromCart = async (hotelId) => {
    setRemoving(hotelId);
    try {
      const response = await fetch(`https://stayfind.onrender.com/api/cart/${hotelId}/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCart(cart.filter((hotel) => hotel.id !== hotelId));
        showToast("Removed from cart", "success");
      } else {
        showToast("Failed to remove from cart", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error removing from cart", "error");
    } finally {
      setRemoving(null);
    }
  };

  const totalPrice = cart.reduce((sum, hotel) => sum + (hotel.price || 0), 0);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Your Cart</h1>
          <p className="text-gray-600">
            {cart.length === 0 ? "Your cart is empty" : `${cart.length} item${cart.length > 1 ? 's' : ''} in cart`}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row"
                >
                  {/* Image */}
                  <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={hotel.imageUrl || hotel.image_url || ""}
                      alt={hotel.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => navigate("/hotel-details", { state: hotel })}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{hotel.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                        <FaMapMarkerAlt className="text-red-500" size={14} /> {hotel.location}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-600">₹{(hotel.price || 0).toLocaleString()}</span>
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold">
                          <FaStar size={12} /> {hotel.rating || "4.5"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 sm:pb-0 sm:px-0 sm:flex sm:flex-col sm:justify-center sm:gap-2 border-t sm:border-l sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => navigate("/hotel-details", { state: hotel })}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                    >
                      <FaChevronRight size={14} /> Details
                    </button>
                    <button
                      onClick={() => navigate("/booking", { state: hotel })}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                    >
                      <FaBookOpen size={14} /> Book
                    </button>
                    <button
                      onClick={() => handleRemoveFromCart(hotel.id)}
                      disabled={removing === hotel.id}
                      className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaTrash size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg sm:rounded-xl p-6 shadow-lg h-fit sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Number of Hotels:</span>
                  <span className="font-semibold">{cart.length}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Subtotal:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (cart.length > 0) {
                    navigate("/booking", { state: cart[0] });
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <FaBookOpen /> Proceed to Book
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-semibold transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCart;
