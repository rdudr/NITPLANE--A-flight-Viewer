import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet markers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
// Using SVG strings for icons to avoid missing asset issues initially
const planeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="30" height="30">
  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
</svg>
`;

const planeIcon = new L.DivIcon({
  html: planeSvg,
  className: 'plane-marker',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const userIcon = new L.DivIcon({
  html: `<div style="background:cyan; width:15px; height:15px; border-radius:50%; box-shadow: 0 0 10px cyan;"></div>`,
  className: '',
  iconSize: [15, 15],
  iconAnchor: [7.5, 7.5]
});

// Sound Setup (Placeholders - will fail gracefully if files missing)
const alertSound = new Howl({ src: ['/alert.mp3'], volume: 0.5 });
const bgMusic = new Howl({ src: ['/websound.mp3'], loop: true, volume: 0.1 });

import LoginPage from './LoginPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [flights, setFlights] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isSimulation, setIsSimulation] = useState(false);

  // 1. Get Location (Auto-update every 5 mins)
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        }, (err) => {
          console.error("Error getting location:", err);
          // Only set default if we don't have a location yet
          setUserLoc(prev => prev || [28.6139, 77.2090]);
        });
      } else {
        setUserLoc(prev => prev || [28.6139, 77.2090]);
      }
    };

    getLocation();
    const interval = setInterval(getLocation, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);



  // 2. Fetch Flights (OpenSky API)
  const fetchFlights = async () => {
    if (!userLoc) return;

    const [lat, lng] = userLoc;
    try {
      // Attempt to fetch live data (GLOBAL - no bounding box)
      const response = await fetch(`https://opensky-network.org/api/states/all`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.states || data.states.length === 0) {
        throw new Error("No live flights found");
      }

      // Map OpenSky Data (Limit to 100 to prevent crash)
      const newFlights = data.states.slice(0, 100).map(state => ({
        id: state[0],
        callsign: state[1].trim() || "N/A",
        origin_country: state[2],
        lng: state[5],
        lat: state[6],
        speed: state[9] || 200, // m/s
        heading: state[10] || 0,
        to: "Unknown",
        from: state[2].toUpperCase(),
        airline: "Unknown"
      }));

      setFlights(newFlights);
      setIsSimulation(false);

    } catch (error) {
      console.warn("Switching to Simulation Mode:", error.message);
      setIsSimulation(true);

      // Generate random mock flights if we don't have any yet or if we want to refresh
      if (flights.length < 5) {
        const generateMockFlight = (i) => {
          const angle = Math.random() * 360;
          const dist = Math.random() * 0.5; // random distance
          return {
            id: `SIM${Date.now()}-${i}`,
            callsign: ["IGO", "AIC", "SEJ", "VTI", "BAW", "UAE"][Math.floor(Math.random() * 6)] + Math.floor(Math.random() * 900 + 100),
            lat: lat + (Math.random() - 0.5),
            lng: lng + (Math.random() - 0.5),
            speed: 200 + Math.random() * 100, // m/s
            heading: Math.random() * 360,
            to: ["DELHI", "MUMBAI", "LONDON", "DUBAI", "NEW YORK"][Math.floor(Math.random() * 5)],
            from: ["CHENNAI", "KOLKATA", "PARIS", "TOKYO", "SINGAPORE"][Math.floor(Math.random() * 5)],
            airline: "Simulated Air"
          };
        };

        const mocks = Array.from({ length: 15 }, (_, i) => generateMockFlight(i));
        setFlights(mocks);
      }
    }
  };

  // 3. Real-time Movement Physics Loop (DISABLED FOR STABILITY)
  /*
  useEffect(() => {
    if (!isStarted || flights.length === 0) return;

    const interval = setInterval(() => {
      setFlights(currentFlights =>
        currentFlights.map(flight => {
          // Move flight based on heading and speed
          // Simple approximation: 1 degree lat ~ 111km
          // Speed is in m/s. Let's scale it for visual effect.
          // 0.00001 degrees per tick is roughly walking speed, so we need more.
          const speedFactor = 0.00005; // Adjust for visual speed
          const rad = flight.heading * (Math.PI / 180);

          return {
            ...flight,
            lat: flight.lat + (Math.cos(rad) * speedFactor),
            lng: flight.lng + (Math.sin(rad) * speedFactor)
          };
        })
      );
    }, 100); // 10fps update for better performance

    return () => clearInterval(interval);
  }, [isStarted, flights.length]);
  */

  // Poll for new data less frequently to avoid overwriting smooth movement too often
  useEffect(() => {
    if (isStarted && userLoc) {
      fetchFlights(); // Initial fetch
      const interval = setInterval(fetchFlights, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isStarted, userLoc]);

  // Haversine Formula for distance
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }
  function deg2rad(deg) { return deg * (Math.PI / 180) }

  const startApp = () => {
    setIsStarted(true);
    bgMusic.play();
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => {
      setIsLoggedIn(true);
      startApp();
    }} />;
  }


  // Helper to get logo URL based on callsign
  const getAirlineLogo = (callsign) => {
    if (!callsign) return null;
    const code = callsign.slice(0, 3).toUpperCase();

    const airlineDomains = {
      'IGO': 'goindigo.in', // IndiGo
      'AIC': 'airindia.in', // Air India
      'SEJ': 'spicejet.com', // SpiceJet
      'VTI': 'airvistara.com', // Vistara
      'AKJ': 'akasaair.com', // Akasa Air
      'GOW': 'goair.in', // Go First
      'IAD': 'airasia.co.in', // AIX Connect
      'BAW': 'britishairways.com',
      'UAE': 'emirates.com',
      'QTR': 'qatarairways.com',
      'SIA': 'singaporeair.com',
      'DLH': 'lufthansa.com',
      'AFR': 'airfrance.com',
      'UAL': 'united.com',
      'AAL': 'aa.com',
      'DAL': 'delta.com'
    };

    const domain = airlineDomains[code];
    if (domain) {
      return `https://logo.clearbit.com/${domain}`;
    }
    return null;
  };

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 z-[1000] w-full p-4 flex justify-between items-center pointer-events-none">
        <div className="glass-card px-6 py-3 pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-widest">NITPLANE</h1>
          <p className="text-[10px] text-gray-400 tracking-[0.2em]">AIRPORT TRAFFIC CONTROLLER</p>
        </div>
        <div className="glass-card px-4 py-2 flex items-center gap-2 pointer-events-auto">
          <div className="live-indicator"></div>
          {/* Signal Bar Graph */}
          <div className="flex items-end gap-[1px] h-3 mx-1">
            <div className="w-[2px] h-1 bg-green-500/50 animate-pulse"></div>
            <div className="w-[2px] h-2 bg-green-500/70 animate-pulse delay-75"></div>
            <div className="w-[2px] h-3 bg-green-500 animate-pulse delay-150"></div>
          </div>
          <span className="text-green-400 text-xs font-mono">LIVE RADAR ACTIVE</span>
        </div>
      </header>

      {/* Map */}
      <MapContainer center={userLoc} zoom={11} scrollWheelZoom={true} className="h-full w-full z-0" zoomControl={false}>
        {/* Dark Mode Tiles - FREE */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {userLoc && <Marker position={userLoc} icon={userIcon} />}

        {flights.filter(f => f.lat && f.lng && !isNaN(f.lat) && !isNaN(f.lng)).map((flight) => (
          <React.Fragment key={flight.id}>
            <Marker
              position={[flight.lat, flight.lng]}
              icon={planeIcon}
            >
              <Popup className="glass-popup">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">{flight.callsign}</h2>
                      <p className="text-gray-400 text-xs tracking-wider">{flight.airline}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10 w-12 h-12 flex items-center justify-center overflow-hidden">
                      {getAirlineLogo(flight.callsign) ? (
                        <img
                          src={getAirlineLogo(flight.callsign)}
                          alt="Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                        />
                      ) : null}
                      <span className="text-xl" style={{ display: getAirlineLogo(flight.callsign) ? 'none' : 'block' }}>✈️</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="col-span-2 bg-white/5 p-2 rounded flex justify-between items-center">
                      <span className="text-gray-400 text-[10px] tracking-widest">FLIGHT NO</span>
                      <span className="font-mono font-bold text-cyan-300">{flight.callsign}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 text-[10px] tracking-widest">FROM</p>
                      <p className="font-mono text-sm">{flight.from}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-gray-500 text-[10px] tracking-widest">TO</p>
                      <p className="font-mono text-sm">{flight.to}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-500 text-[10px] tracking-widest">SPEED</p>
                      <p className="font-mono text-sm text-cyan-400">{Math.round(flight.speed * 3.6)} km/h</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-gray-500 text-[10px] tracking-widest">ETA</p>
                      <p className="font-mono text-sm">45 MIN</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            {/* Dotted Line to Destination (Simulated) */}
            <Polyline
              positions={[[flight.lat, flight.lng], [flight.lat + 0.5, flight.lng + 0.5]]}
              pathOptions={{ color: 'cyan', dashArray: '5, 10', opacity: 0.3, weight: 1 }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Footer */}
      <footer className="absolute bottom-0 z-[1000] w-full p-3 text-center text-[10px] text-gray-500 bg-black/80 backdrop-blur-md border-t border-white/5">
        dund le aas pass saare flights khu ki sapna h yeh jo kabhi sach hoga Made for MANVENDRA UFF GATIYA Made by RD
      </footer>
    </div>
  );
}

export default App;
