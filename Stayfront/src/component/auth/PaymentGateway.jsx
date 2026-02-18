import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCreditCard, FaLock, FaCheckCircle, FaTimesCircle, FaMobileAlt } from "react-icons/fa";
import Toast from "../common/Toast";

export const PaymentGateway = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { hotel, checkIn, checkOut, guests, totalAmount, email, bookingData } = state || {};

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'upi'
  
  // Card payment state
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  
  // UPI payment state
  const [upiId, setUpiId] = useState("");
  
  // Common payment state
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    if (!hotel || !totalAmount) {
      navigate("/");
    }
  }, [hotel, totalAmount, navigate]);

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace(/\//g, "").length <= 4) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const validateCardForm = () => {
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setToast({ message: "Please enter a valid 16-digit card number", type: "error" });
      return false;
    }
    if (!cardName.trim()) {
      setToast({ message: "Please enter cardholder name", type: "error" });
      return false;
    }
    if (expiryDate.length !== 5) {
      setToast({ message: "Please enter valid expiry date (MM/YY)", type: "error" });
      return false;
    }
    if (cvv.length !== 3) {
      setToast({ message: "Please enter valid 3-digit CVV", type: "error" });
      return false;
    }
    return true;
  };

  const validateUpiForm = () => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(upiId)) {
      setToast({ message: "Please enter a valid UPI ID (e.g., username@paytm)", type: "error" });
      return false;
    }
    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate form based on payment method
    if (paymentMethod === "card" && !validateCardForm()) return;
    if (paymentMethod === "upi" && !validateUpiForm()) return;

    setProcessing(true);
    setToast({ message: "Initializing payment...", type: "info" });

    try {
      const token = localStorage.getItem("authToken");

      // Step 1: Create payment order with backend
      const orderResponse = await fetch("http://127.0.0.1:8000/api/payment/create-order/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotel_id: hotel.id,
          total_amount: totalAmount,
          check_in: checkIn,
          check_out: checkOut,
          guest_count: guests,
          guest_email: email,
          payment_method: paymentMethod,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const orderData = await orderResponse.json();
      setBookingId(orderData.booking_id);

      // Step 2: Initialize Razorpay
      const options = {
        key: orderData.razorpay_key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StayFind",
        description: `Booking at ${hotel.title}`,
        order_id: orderData.razorpay_order_id,
        customer_id: orderData.booking_id,
        prefill: {
          name: orderData.customer_name,
          email: orderData.customer_email,
        },
        method: {
          card: paymentMethod === "card",
          upi: paymentMethod === "upi",
        },
        handler: async (response) => {
          // Step 3: Verify payment with backend
          try {
            const verifyResponse = await fetch("http://127.0.0.1:8000/api/payment/verify/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: orderData.booking_id,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();
            setPaymentStatus("success");
            setToast({ message: "Payment successful! Redirecting...", type: "success" });

            setTimeout(() => {
              navigate("/booking-ticket", {
                state: {
                  booking: {
                    ...verifyData.booking,
                    hotel,
                    checkIn,
                    checkOut,
                    guests,
                    totalAmount,
                    email,
                    paymentMethod: paymentMethod === "card" ? `Card ending in ${cardNumber.slice(-4)}` : `UPI: ${upiId}`,
                  },
                },
              });
            }, 1500);
          } catch (error) {
            setPaymentStatus("failed");
            setToast({ message: "Payment verification failed", type: "error" });
            setProcessing(false);

            // Record payment failure
            await fetch("http://127.0.0.1:8000/api/payment/failed/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                booking_id: orderData.booking_id,
                reason: error.message,
              }),
            });
          }
        },
        modal: {
          ondismiss: async () => {
            setProcessing(false);
            setToast({ message: "Payment cancelled", type: "warning" });
            
            // Record payment failure
            await fetch("http://127.0.0.1:8000/api/payment/failed/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                booking_id: orderData.booking_id,
                reason: "User cancelled the payment",
              }),
            });
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      setPaymentStatus("failed");
      setToast({ message: `Payment error: ${error.message}`, type: "error" });
      setProcessing(false);
    }
  };

  if (!hotel) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaLock className="text-green-600" />
                Secure Payment Gateway
              </h1>
              <p className="text-sm text-gray-500 mt-1">Choose your preferred payment method</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Amount to pay</p>
              <p className="text-3xl font-bold text-blue-600">₹{totalAmount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 bg-white shadow-lg rounded-b-2xl p-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <form onSubmit={handlePayment} className="space-y-5">
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Card Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <FaCreditCard className="mx-auto text-2xl mb-2" style={{
                      color: paymentMethod === "card" ? "#2563eb" : "#999"
                    }} />
                    <p className="font-semibold text-sm">Card</p>
                    <p className="text-xs text-gray-500">Debit/Credit</p>
                  </button>

                  {/* UPI Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === "upi"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <FaMobileAlt className="mx-auto text-2xl mb-2" style={{
                      color: paymentMethod === "upi" ? "#2563eb" : "#999"
                    }} />
                    <p className="font-semibold text-sm">UPI</p>
                    <p className="text-xs text-gray-500">Fast & Easy</p>
                  </button>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === "card" && (
                <div className="space-y-5 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 text-sm">Card Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg tracking-wider"
                        disabled={processing}
                      />
                      <FaCreditCard className="absolute right-4 top-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="JOHN DOE"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        disabled={processing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                        disabled={processing}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === "upi" && (
                <div className="space-y-5 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 text-sm">UPI Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@paytm"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      disabled={processing}
                    />
                    <p className="text-xs text-gray-500 mt-2">Examples: @paytm, @okhdfcbank, @ybl, @googleplay</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <p className="font-semibold">Test Mode - Real Payment Through Razorpay</p>
                <p className="text-xs mt-1">Use Razorpay's secure payment interface. Your payment details are encrypted.</p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  processing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaLock />
                    Pay ₹{totalAmount?.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 h-fit">
            <h3 className="font-semibold text-gray-800 mb-4 text-lg">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 font-medium">{hotel?.title}</p>
                <p className="text-gray-500 text-xs">{hotel?.location}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{checkIn}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{checkOut}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-xs">{email}</span>
                </div>
              </div>
              <div className="border-t-2 border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FaLock className="text-green-600" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            <span>Razorpay Secure</span>
          </div>
        </div>
      </div>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default PaymentGateway;
