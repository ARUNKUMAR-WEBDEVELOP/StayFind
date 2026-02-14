import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Toast from "../common/Toast";
import Navbar from "./Navbar";
import { FaCalendar, FaUsers, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

export const Booking = () => {
  const { state: hotel } = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [checkIn, setCheckIn] = useState("");   
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const validateDates = () => {
    if (!checkIn || !checkOut) {
      showToast("Please select both check-in and check-out dates", "error");
      return false;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      showToast("Check-out date must be after check-in date", "error");
      return false;
    }
    if (guests < 1) {
      showToast("Select at least 1 guest", "error");
      return false;
    }
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return false;
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateDates()) return;

    if (!token) {
      showToast("Please login to book", "error");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    // Redirect to payment gateway
    navigate("/payment-gateway", {
      state: {
        hotel,
        checkIn,
        checkOut,
        guests,
        email,
        totalAmount: totalPrice,
      },
    });
  };

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="mt-24 text-center">
          <p className="text-gray-600">Hotel information not found.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0;
  const totalPrice = nights > 0 ? hotel.price * nights : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 font-semibold mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hotel Summary */}
          <div className="lg:col-span-1 bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg h-fit sticky top-24">
            <img
              src={hotel.image_url || hotel.imageUrl}
              alt={hotel.title}
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="font-bold text-lg text-gray-800 mb-2">{hotel.title}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1 mb-4">
              <FaMapMarkerAlt className="text-red-500" /> {hotel.location}
            </p>
            
            {nights > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per night:</span>
                  <span className="font-bold">₹{hotel.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-bold">{nights}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="font-bold text-lg text-green-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl p-4 sm:p-8 shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Complete Your Booking</h2>

            <div className="space-y-6">
              {/* Check-in */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendar className="text-blue-600" /> Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                />
                <p className="text-xs text-gray-500 mt-1">Select your arrival date</p>
              </div>

              {/* Check-out */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendar className="text-blue-600" /> Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                />
                <p className="text-xs text-gray-500 mt-1">Select your departure date</p>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaUsers className="text-blue-600" /> Number of Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                />
                <p className="text-xs text-gray-500 mt-1">Number of people staying</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaEnvelope className="text-blue-600" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition"
                />
                <p className="text-xs text-gray-500 mt-1">Booking confirmation will be sent to this email</p>
              </div>

              {/* Booking Summary */}
              {checkIn && checkOut && nights > 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{nights} night{nights > 1 ? 's' : ''}</span> for <span className="font-semibold">{guests} guest{guests > 1 ? 's' : ''}</span>
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    Total: ₹{totalPrice.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Booking Button */}
              <button
                onClick={handleBooking}
                disabled={loading || !checkIn || !checkOut || !email}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  `Proceed to Payment - ₹${totalPrice.toLocaleString()}`
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                By booking, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
