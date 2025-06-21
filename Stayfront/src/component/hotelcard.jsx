import React from 'react';
import { useNavigate } from 'react-router-dom';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hotel/${encodeURIComponent(hotel.title)}`, { state: hotel });
  };

  return (
    <div className="bg-white shadow rounded p-3 cursor-pointer hover:scale-105 transition" onClick={handleClick}>
      <img src={hotel.imageUrl} alt={hotel.title} className="w-full h-48 object-cover rounded" />
      <div className="mt-2">
        <h3 className="text-lg font-semibold">{hotel.title}</h3>
        <p className="text-sm text-gray-500">{hotel.location}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-blue-600 font-bold">{hotel.price}</span>
          <span className="text-yellow-500">⭐ {hotel.rating}</span>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
