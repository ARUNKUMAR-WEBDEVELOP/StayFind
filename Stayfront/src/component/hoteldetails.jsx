import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { FaHeart, FaShoppingCart, FaBookOpen, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "./auth/Navbar";
import Toast from "./common/Toast";

const API_BASE = "http://127.0.0.1:8000";

const HotelDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [hotel, setHotel] = useState(state || null);
  const [loading, setLoading] = useState(!state);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [availability, setAvailability] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!hotel && id) {
      fetch(`${API_BASE}/api/hotels/${id}/`)
        .then((res) => res.json())
        .then((data) => {
          setHotel(data);
          setLoading(false);
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        })
        .catch(() => setLoading(false));
    }
    
    // Track visited location
    if (hotel && hotel.location) {
      const visited = localStorage.getItem('visitedLocations');
      let locations = visited ? JSON.parse(visited) : [];
      if (!locations.includes(hotel.location)) {
        locations.push(hotel.location);
        localStorage.setItem('visitedLocations', JSON.stringify(locations));
      }
    }
  }, [id, hotel]);

  useEffect(() => {
    const hotelId = id || hotel?.id;
    if (!hotelId) return;
    fetch(`${API_BASE}/api/hotels/${hotelId}/reviews/`)
      .then((res) => res.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]));
  }, [id, hotel?.id]);

  useEffect(() => {
    const hotelId = id || hotel?.id;
    if (!hotelId || !token) {
      setCanReview(false);
      return;
    }

    fetch(`${API_BASE}/api/booking/view/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const booked = Array.isArray(data)
          ? data.some((item) => String(item.id) === String(hotelId))
          : false;
        setCanReview(booked);
      })
      .catch(() => setCanReview(false));
  }, [id, hotel?.id, token]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!hotel) return <p className="text-center mt-10">Hotel not found.</p>;

  // Parse details if it's a JSON string
  let details = hotel.details;
  if (typeof details === "string") {
    try {
      details = JSON.parse(details);
    } catch {
      details = {};
    }
  }
  const checkAvailability = async () => {
    const hotelId = id || hotel?.id;
    const res = await fetch(`${API_BASE}/api/booking/check/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotel_id: hotelId, check_in: checkIn, check_out: checkOut }),
    });
    const data = await res.json();
    setAvailability(data.message);
  };

  const addToCart = async () => {
    if (!token) {
      showToast("Please login to add items to your cart.", "error");
      return;
    }

    const hotelId = id || hotel?.id;
    if (!hotelId) {
      showToast("Hotel ID is missing.", "error");
      return;
    }

    const res = await fetch(`${API_BASE}/api/cart/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hotel_id: hotelId }),
    });

    if (!res.ok) {
      const error = await res.json();
      showToast(error.error || error.message || "Failed to add to cart", "error");
      return;
    }

    const data = await res.json();
    showToast(data.message || "Added to cart", "success");
  };

  const addToWishlist = async () => {
    if (!token) {
      showToast("Please login to add to wishlist.", "error");
      return;
    }

    const hotelId = id || hotel?.id;
    if (!hotelId) {
      showToast("Hotel ID is missing.", "error");
      return;
    }

    const res = await fetch(`${API_BASE}/api/wishlist/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hotel_id: hotelId }),
    });

    if (!res.ok) {
      const error = await res.json();
      showToast(error.error || error.message || "Failed to add to wishlist", "error");
      return;
    }

    const data = await res.json();
    showToast(data.message || "Added to wishlist", "success");
  };

  const submitReview = async () => {
    if (!token) {
      showToast("Please login to leave a review.", "error");
      return;
    }

    const hotelId = id || hotel?.id;
    if (!hotelId) {
      showToast("Hotel ID is missing.", "error");
      return;
    }

    if (!reviewRating) {
      showToast("Please select a rating.", "error");
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/hotels/${hotelId}/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(reviewRating),
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to submit review");
      }

      setReviews((prev) => [data, ...prev]);
      setReviewRating("");
      setReviewComment("");
      showToast("Thanks for your feedback!", "success");
    } catch (err) {
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      
      <div className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
        {/* Image Container */}
        <div className="rounded-lg sm:rounded-2xl overflow-hidden shadow-lg mb-6 sm:mb-8 h-64 sm:h-96 lg:h-[500px]">
          <img
            src={hotel.image_url || hotel.imageUrl}
            alt={hotel.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">{hotel.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-gray-600">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-500" /> {hotel.location}
                </span>
                <span className="text-yellow-600 font-semibold">⭐ {hotel.rating}/5</span>
              </div>
              <p className="mt-3 text-gray-700">{hotel.place}</p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">About</h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{hotel.details}</p>
            </div>

            {/* Amenities */}
            {details && Object.keys(details).length > 0 && (
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {details.guests && <li className="flex items-center gap-2 text-gray-700"><span>👥</span> {details.guests} Guests</li>}
                  {details.beds && <li className="flex items-center gap-2 text-gray-700"><span>🛏️</span> {details.beds} Beds</li>}
                  {details.bathrooms && <li className="flex items-center gap-2 text-gray-700"><span>🚿</span> {details.bathrooms} Bathrooms</li>}
                  {details.wifi && <li className="flex items-center gap-2 text-gray-700"><span>📶</span> Free WiFi</li>}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={review.id || idx} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">{review.user || "Guest"}</span>
                        <span className="text-yellow-600">⭐ {review.rating}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment || "No comment"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              )}

              <div className="mt-6 border-t pt-4">
                <h3 className="text-base font-semibold text-gray-800 mb-3">Leave a review</h3>
                {canReview ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="">Select rating</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                      <button
                        onClick={submitReview}
                        disabled={reviewSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Share your experience (optional)"
                      className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Only booked users can leave a review.</p>
                )}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" /> Location Map
              </h2>
              <div className="rounded-lg overflow-hidden border-4 border-blue-100 h-80">
                <iframe
                  title="Hotel Location Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.location)}&output=embed`}
                  className="w-full h-full"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg sticky top-24">
              <div className="mb-6">
                <p className="text-blue-100 text-sm">Starting from</p>
                <p className="text-3xl sm:text-4xl font-bold">₹{hotel.price.toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-1">per night</p>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white bg-opacity-20 text-white placeholder-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white bg-opacity-20 text-white placeholder-blue-100 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <button
                  onClick={checkAvailability}
                  className="w-full bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
                >
                  Check Availability
                </button>
              </div>

              {availability && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${availability.includes('not') ? 'bg-red-400 bg-opacity-30' : 'bg-green-400 bg-opacity-30'}`}>
                  {availability}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={addToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaShoppingCart /> Add to Cart
              </button>
              <button
                onClick={addToWishlist}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 sm:py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaHeart /> Add to Wishlist
              </button>
              <button
                onClick={() => navigate("/booking", { state: hotel })}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 sm:py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <FaBookOpen /> Book Now
              </button>
            </div>

            {/* Availability Calendar */}
            {availability && (
              <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Availability Status</h3>
                <div className={`p-3 rounded-lg text-sm ${availability.includes('not') || availability.includes('failed') ? 'bg-red-400 bg-opacity-30' : 'bg-green-400 bg-opacity-30'}`}>
                  {availability}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;