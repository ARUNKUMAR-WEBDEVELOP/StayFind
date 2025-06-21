import React from 'react';
import HotelCard from './hotelcard';

const LocationSection = ({ location, hotels }) => {
  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">{location}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {hotels.map((hotel, idx) => (
          <HotelCard key={idx} hotel={hotel} />
        ))}
      </div>
    </section>
  );
};

export default LocationSection;
