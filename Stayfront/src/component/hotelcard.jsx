import React from 'react';
import { useNavigate } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hotels/${encodeURIComponent(hotel.title)}`, { state: hotel });
  };
  const handleAction = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to use this feature");
    return;
  }
    };

  return (
    // <div className="bg-white shadow rounded p-3 cursor-pointer hover:scale-105 transition" onClick={handleClick}>
    <div
      onClick={() => navigate(`/hotel/${hotel.id}`)}
      className="border p-4 rounded-lg cursor-pointer"
    >
      <img src={hotel.imageUrl} alt={hotel.title} className="w-full h-48 object-cover rounded" />
      <div className="mt-2">
        <h3 className="text-lg font-semibold">{hotel.title}</h3>
        <p className="text-sm text-gray-500">{hotel.location}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-blue-600 font-bold">{hotel.price}</span>
          <span className="text-red-500">⭐ {hotel.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
