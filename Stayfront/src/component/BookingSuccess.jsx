import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../component/auth/Navbar";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    const data = location.state;
    if (!data || !data.token) {
      navigate("/");
      return;
    }
    setBookingData(data);
  }, [location.state, navigate]);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="pt-24 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const { status, token, hotel, checkIn, checkOut, totalAmount } = bookingData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pb-8">
        <div className="bg-white rounded-lg sm:rounded-2xl p-6 sm:p-10 shadow-lg text-center">
          {status === "success" ? (
            <>
              <FaCheckCircle className="text-green-500 text-6xl sm:text-7xl mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600 mb-6">Your payment was successful</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Booking Token</p>
                <p className="text-lg sm:text-xl font-bold text-green-700">{token}</p>
              </div>

              <div className="text-left bg-gray-50 rounded-lg p-4 space-y-2 mb-6">
                <h2 className="font-semibold text-gray-800 mb-3">Booking Details</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hotel:</span>
                  <span className="font-medium">{hotel?.title || "Hotel"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{checkIn}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{checkOut}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-green-600">₹{totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-6">
                A confirmation email has been sent to your registered email address.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/account")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Back to Home
                </button>
              </div>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-red-500 text-6xl sm:text-7xl mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Booking Failed</h1>
              <p className="text-gray-600 mb-6">Payment could not be processed</p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">
                  {bookingData.message || "An error occurred during payment. Please try again."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Back to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
