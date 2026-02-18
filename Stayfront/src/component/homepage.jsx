import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import LocationSection from './locationsection';
import Navbar from './auth/Navbar';
import Toast from './common/Toast';

const API_BASE = "https://stayfind.onrender.com";

const Homepage = () => {
  const location = useLocation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [visitedLocations, setVisitedLocations] = useState([]);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [displayedHotels, setDisplayedHotels] = useState(12);
  const [searchQuery, setSearchQuery] = useState("");
  const observerTarget = useRef(null);
  const hotelsPerPage = 12;

  // Fetch all hotels
  useEffect(() => {
    const ac = new AbortController();
    const fetchHotels = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/hotels/`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setHotels(Array.isArray(data) ? data : []);
        setDisplayedHotels(hotelsPerPage);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Fetch error');
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
    return () => ac.abort();
  }, []);

  // Read search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);

  // Load visited locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('visitedLocations');
    if (saved) {
      try {
        setVisitedLocations(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const filteredHotels = searchQuery
    ? hotels.filter((hotel) => {
        const q = searchQuery.toLowerCase();
        return (
          (hotel.title || "").toLowerCase().includes(q) ||
          (hotel.location || "").toLowerCase().includes(q) ||
          (hotel.place || "").toLowerCase().includes(q)
        );
      })
    : hotels;

  // Get recommendations based on visited locations
  useEffect(() => {
    if (visitedLocations.length > 0 && hotels.length > 0 && !searchQuery) {
      const recommended = hotels
        .filter((hotel) => visitedLocations.includes(hotel.location))
        .slice(0, 6);
      setRecommendedHotels(recommended);
    } else {
      setRecommendedHotels([]);
    }
  }, [visitedLocations, hotels, searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedHotels < filteredHotels.length) {
          setTimeout(() => {
            setDisplayedHotels((prev) => Math.min(prev + hotelsPerPage, filteredHotels.length));
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [displayedHotels, filteredHotels.length]);

  useEffect(() => {
    setDisplayedHotels(hotelsPerPage);
  }, [searchQuery]);

  // Get user location & find nearby hotels
  useEffect(() => {
    if (navigator.geolocation && hotels.length > 0 && !searchQuery && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // Calculate distance and find nearby hotels
          const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Radius of Earth in km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
          };
          
          // Extract lat/long from map_url and calculate distance
          const hotelsWithDistance = hotels.map(hotel => {
            if (hotel.map_url || hotel.mapUrl) {
              const url = hotel.map_url || hotel.mapUrl;
              const match = url.match(/q=([\d.-]+),([\d.-]+)/);
              if (match) {
                const hotelLat = parseFloat(match[1]);
                const hotelLon = parseFloat(match[2]);
                const distance = calculateDistance(latitude, longitude, hotelLat, hotelLon);
                return { ...hotel, distance };
              }
            }
            return { ...hotel, distance: Infinity };
          });
          
          const nearby = hotelsWithDistance
            .filter(h => h.distance < 100) // Within 100km
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);
          
          if (nearby.length > 0) {
            setNearbyHotels(nearby);
            setShowNearby(true);
            setToast({ message: `📍 Found ${nearby.length} hotels near you!`, type: "success" });
          } else {
            setToast({ message: "📍 Location detected. No nearby hotels found.", type: "info" });
          }
        },
        () => {
          setToast({ message: "Enable location to see nearby hotels", type: "info" });
        }
      );
    }
  }, [hotels, searchQuery, userLocation]);

  // Group hotels by location with lazy loading
  const groupedHotels = filteredHotels.slice(0, displayedHotels).reduce((groups, hotel) => {
    const location = hotel.location || 'Unknown';
    if (!groups[location]) groups[location] = [];
    groups[location].push(hotel);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Navbar />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />

      {/* Hero Section */}
      <section className="relative mt-16 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 text-white rounded-lg sm:rounded-2xl shadow-lg mx-2 sm:mx-4 lg:mx-8 animate-fade-in">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Find Your Perfect Stay</h1>
          <p className="text-base sm:text-lg text-blue-100">Discover amazing hotels and resorts at the best prices</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {searchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Search results for "{searchQuery}"
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {filteredHotels.length} {filteredHotels.length === 1 ? 'hotel' : 'hotels'} found
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                navigate("/");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-12 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading hotels…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-4 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Recommended Hotels Section */}
        {!loading && !error && recommendedHotels.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⭐</span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Recommended For You</h2>
                <p className="text-sm text-gray-500">Based on places you've visited</p>
              </div>
            </div>
            <LocationSection location="" hotels={recommendedHotels} />
          </div>
        )}

        {/* Nearby Hotels Section */}
        {!loading && !error && showNearby && nearbyHotels.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">📍</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Hotels Near You</h2>
            </div>
            <LocationSection location="" hotels={nearbyHotels} />
          </div>
        )}

        {/* All Hotels by Location */}
        {!loading && !error && Object.keys(groupedHotels).length === 0 && (
          <p className="text-center text-gray-600">No hotels found.</p>
        )}

        {!loading && !error &&
          Object.keys(groupedHotels).map((location, idx) => (
            <div key={location} className={`mb-12 animate-fade-in`} style={{ animationDelay: `${idx * 100}ms` }}>
              <LocationSection location={location} hotels={groupedHotels[location]} />
            </div>
          ))
        }

        {/* Loading more indicator */}
        {displayedHotels < filteredHotels.length && (
          <div className="py-8 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 text-sm">Loading more hotels...</span>
            </div>
          </div>
        )}

        {/* Infinite scroll observer */}
        <div ref={observerTarget} className="py-8 text-center text-gray-500 text-sm">
          {!loading && displayedHotels >= filteredHotels.length && filteredHotels.length > 0 && "✨ All hotels loaded"}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
