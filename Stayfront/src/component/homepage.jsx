import React, { useEffect, useState } from 'react';
import LocationSection from './locationsection';

const Homepage = () => {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/hotels/", {
      headers: {
        Authorization: "Token YOUR_AUTH_TOKEN"
      }
    })
    .then(res => res.json())
    .then(data => setHotels(data));
  }, []);

  // Group hotels by location
  const groupedHotels = hotels.reduce((groups, hotel) => {
    const location = hotel.location;
    if (!groups[location]) {
      groups[location] = [];
    }
    groups[location].push(hotel);
    return groups;
  }, {});

  return (
    <div className="px-6">
      {Object.keys(groupedHotels).map((location, index) => (
        <LocationSection key={index} location={location} hotels={groupedHotels[location]} />
      ))}
    </div>
  );
};

export default Homepage;
