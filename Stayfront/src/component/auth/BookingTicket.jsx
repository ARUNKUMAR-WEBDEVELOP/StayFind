import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaDownload, FaPrint, FaHome, FaCalendar, FaUsers, FaEnvelope, FaCreditCard, FaHotel, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "./Navbar";

export const BookingTicket = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ticketRef = useRef();
  const { booking } = state || {};

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No booking information found</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    const ticketHTML = ticketRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Confirmation - ${booking.bookingToken}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .ticket { max-width: 800px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { border: 2px solid #e5e7eb; border-top: none; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .divider { border-top: 1px dashed #d1d5db; margin: 20px 0; }
            .qr-code { text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${ticketHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
        {/* Success Animation */}
        <div className="text-center mb-8 animate-fade-in print:hidden">
          <div className="inline-block">
            <div className="bg-green-100 rounded-full p-6 mb-4">
              <FaCheckCircle className="text-6xl text-green-600 animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully processed</p>
        </div>

        {/* Ticket */}
        <div ref={ticketRef} className="ticket bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">StayFind</h2>
                <p className="text-blue-100">E-Ticket Confirmation</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-xs text-blue-100">Booking ID</p>
                  <p className="text-xl font-mono font-bold">{booking.bookingToken}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Details */}
          <div className="p-8 border-b-2 border-dashed border-gray-200">
            <div className="flex items-start gap-4">
              {booking.hotel?.image_url && (
                <img
                  src={booking.hotel.image_url}
                  alt={booking.hotel.title}
                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaHotel className="text-blue-600" />
                  {booking.hotel?.title}
                </h3>
                <p className="text-gray-600 flex items-center gap-2 mb-3">
                  <FaMapMarkerAlt className="text-red-500" />
                  {booking.hotel?.location}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="bg-blue-50 px-3 py-1 rounded-full">★ {booking.hotel?.rating || "N/A"}</span>
                  {booking.hotel?.place && (
                    <span className="bg-gray-50 px-3 py-1 rounded-full">{booking.hotel.place}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="p-8 grid md:grid-cols-2 gap-8">
            {/* Guest Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Guest Details</h4>
              
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-800">{booking.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaUsers className="text-blue-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Number of Guests</p>
                  <p className="font-medium text-gray-800">{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaCreditCard className="text-blue-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-800">{booking.paymentMethod || "Card Payment"}</p>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Stay Details</h4>
              
              <div className="flex items-center gap-3">
                <FaCalendar className="text-green-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Check-in</p>
                  <p className="font-medium text-gray-800">{new Date(booking.checkIn).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaCalendar className="text-red-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Check-out</p>
                  <p className="font-medium text-gray-800">{new Date(booking.checkOut).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Stay Duration</p>
                <p className="text-2xl font-bold text-blue-600">{calculateNights()} {calculateNights() === 1 ? 'Night' : 'Nights'}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-8 bg-gray-50 border-t-2 border-dashed border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Room Rate × {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}</span>
                <span>₹{booking.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes & Service Charges</span>
                <span>Included</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 mt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-800">Total Amount Paid</span>
                <span className="text-2xl font-bold text-green-600">₹{booking.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <p className="font-semibold">✓ Payment Status: Confirmed</p>
              <p className="text-xs mt-1">Booking confirmed on {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-8 text-center border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Scan this code at hotel reception for quick check-in</p>
            <div className="inline-block bg-white p-4 border-2 border-gray-200 rounded-lg">
              <div className="bg-gray-800 text-white font-mono text-xs p-3 rounded">
                {booking.bookingToken}
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="p-8 bg-blue-50">
            <h4 className="font-semibold text-gray-800 mb-3">Important Information</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Please carry a valid government-issued photo ID at the time of check-in</li>
              <li>• Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
              <li>• A confirmation email has been sent to {booking.email}</li>
              <li>• For any queries, please contact the hotel directly</li>
              <li>• Cancellation policy: Free cancellation up to 24 hours before check-in</li>
            </ul>
          </div>

          {/* Email Confirmation Notice */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-t-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-full p-3">
                <FaEnvelope className="text-green-600 text-2xl" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Confirmation Email Sent!</p>
                <p className="text-sm text-gray-600">
                  A detailed confirmation with booking receipt has been sent to <strong>{booking.email}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaDownload />
            Download Ticket
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaPrint />
            Print Ticket
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl"
          >
            <FaHome />
            Back to Home
          </button>
        </div>

        {/* Additional Message */}
        <div className="mt-8 text-center text-gray-600 text-sm print:hidden">
          <p>Thank you for booking with StayFind! We hope you have a wonderful stay.</p>
          <p className="mt-2 text-xs text-gray-500">This is a simulated booking system for portfolio demonstration purposes.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingTicket;
