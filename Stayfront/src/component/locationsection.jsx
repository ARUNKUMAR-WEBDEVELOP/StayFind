import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaStar } from "react-icons/fa";
import Toast from "./common/Toast";

const LocationSection = ({ location, hotels = [] }) => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [loadingId, setLoadingId] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const handleAddToCart = async (e, hotelId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to add items", "error");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    setLoadingId(hotelId);
    try {
      const res = await fetch("https://stayfind.onrender.com/api/cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hotel_id: hotelId }),
      });

      if (!res.ok) throw new Error("Failed");
      showToast("✓ Added to cart", "success");
    } catch (err) {
      showToast("Failed to add to cart", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddToWishlist = async (e, hotelId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login", "error");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    setLoadingId(hotelId);
    try {
      const res = await fetch("https://stayfind.onrender.com/api/wishlist/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hotel_id: hotelId }),
      });

      if (!res.ok) throw new Error("Failed");
      showToast("❤️ Added to wishlist", "success");
    } catch (err) {
      showToast("Failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  if (!hotels.length) return null;

  return (
    <section className="mt-8 sm:mt-12">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      {location && (
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">📍</span> {location}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {hotels.map((hotel, index) => {
          const img = hotel.imageUrl ?? hotel.image_url ?? "";
          const title = hotel.title ?? "Untitled";
          const price = hotel.price ?? "";
          const rating = hotel.rating ?? "";
          const place = hotel.place ?? "";

          return (
            <article
              key={hotel.id}
              className="group bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                to="/hotel-details"
                state={hotel}
                className="block h-full flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0">
                  {img ? (
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 shadow-lg">
                    <FaStar size={12} /> {rating}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
                      {title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{place}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                    <span className="text-lg sm:text-xl font-bold text-blue-600">
                      ₹{price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50 group-hover:bg-gray-100 transition">
                <button
                  onClick={(e) => handleAddToCart(e, hotel.id)}
                  disabled={loadingId === hotel.id}
                  className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition transform hover:scale-105 active:scale-95"
                  title="Add to Cart"
                >
                  <FaShoppingCart size={14} />
                  <span className="hidden sm:inline">Cart</span>
                </button>
                <button
                  onClick={(e) => handleAddToWishlist(e, hotel.id)}
                  disabled={loadingId === hotel.id}
                  className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition transform hover:scale-105 active:scale-95"
                  title="Add to Wishlist"
                >
                  <FaHeart size={14} />
                  <span className="hidden sm:inline">Like</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default LocationSection;
