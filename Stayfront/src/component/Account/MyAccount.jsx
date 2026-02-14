// src/component/account/MyAccount.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../auth/Navbar";
import { FaCalendar, FaEnvelope, FaTicketAlt, FaHotel, FaUsers } from "react-icons/fa";

export const MyAccount = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [wishesRes, cartRes, bookingRes] = await Promise.all([
          fetch("http://localhost:8000/api/wishlist/view/", { headers }),
          fetch("http://localhost:8000/api/cart/view/", { headers }),
          fetch("http://localhost:8000/api/booking/view/", { headers }),
        ]);

        setWishlist(await wishesRes.json());
        setCart(await cartRes.json());
        setBookings(await bookingRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const viewTicket = (booking) => {
    navigate("/booking-ticket", {
      state: {
        booking: {
          bookingToken: booking.booking_token,
          hotel: booking.hotel,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          guests: booking.guest_count || 1,
          totalAmount: booking.total_amount,
          email: booking.guest_email,
          paymentMethod: "Card Payment",
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Account</h2>
          <p className="text-gray-600">Welcome back, {user?.displayName || user?.email || "Guest"}!</p>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaTicketAlt className="text-blue-600" />
            My Bookings
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FaHotel className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Browse Hotels
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {booking.hotel?.imageUrl && (
                        <img
                          src={booking.hotel.imageUrl}
                          alt={booking.hotel?.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <FaHotel className="text-blue-600" />
                          {booking.hotel?.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-3">{booking.hotel?.location}</p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendar className="text-green-600" />
                            <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendar className="text-red-600" />
                            <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaUsers className="text-blue-600" />
                            <span>{booking.guest_count || 1} Guest(s)</span>
                          </div>
                          {booking.guest_email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaEnvelope className="text-purple-600" />
                              <span className="truncate">{booking.guest_email}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {booking.payment_status === "completed" ? "✓ Confirmed" : booking.payment_status}
                          </span>
                          <span className="font-mono text-sm text-gray-500">
                            {booking.booking_token}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-blue-600 mb-3">
                        ₹{booking.total_amount?.toLocaleString()}
                      </p>
                      <button
                        onClick={() => viewTicket(booking)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <FaTicketAlt />
                        View Ticket
                      </button>
                    </div>
                  </div>
                  
                  {/* Email Confirmation Notice */}
                  {booking.guest_email && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                      <p className="text-blue-800">
                        📧 Confirmation email sent to <strong>{booking.guest_email}</strong>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wishlist & Cart Summary */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Wishlist</h3>
            {wishlist.length === 0 ? (
              <p className="text-gray-500">No items in wishlist</p>
            ) : (
              <p className="text-gray-600">{wishlist.length} item(s) saved</p>
            )}
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">No items in cart</p>
            ) : (
              <p className="text-gray-600">{cart.length} item(s) in cart</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
