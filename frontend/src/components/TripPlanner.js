import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Weather from "./Weather";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const hazardIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const FitBounds = ({ coordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);
      map.fitBounds(latLngs, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  return null;
};

const TripPlanner = () => {
  const [locations, setLocations] = useState(["", ""]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [mode, setMode] = useState("car");
  const [loading, setLoading] = useState(false);
  const [hazards, setHazards] = useState([]);
  const [reportingHazard, setReportingHazard] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [activeHazard, setActiveHazard] = useState(null);
  const navigate = useNavigate();
  const API_KEY = "5b3ce3597851110001cf62486d99a38bfff7441d9299c4625a9d300a";

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true }
    );
    fetchHazards();
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const fetchHazards = async () => {
    try {
      const res = await axios.get("http://localhost:5000/hazards");
      setHazards(res.data);
    } catch (err) {
      console.error("Error loading hazards:", err);
    }
  };

  const handleMapClick = async (e) => {
    if (!reportingHazard) return;
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const type = window.prompt("Enter hazard type (flood, accident, etc.):");
    if (!type) return;

    try {
      await axios.post("http://localhost:5000/report-hazard", {
        lat,
        lng,
        type,
      });
      alert("Hazard reported successfully!");
      fetchHazards();
    } catch (err) {
      alert("Failed to report hazard");
    }
    setReportingHazard(false);
  };

  const confirmHazard = async (id) => {
    try {
      await axios.post(`http://localhost:5000/confirm-hazard/${id}`);
      alert("✅ Hazard confirmed!");
      setActiveHazard(null);
      fetchHazards();
    } catch (err) {
      alert("Failed to confirm hazard");
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const speak = (text) => {
    if (!voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleChange = (index, value) => {
    const updated = [...locations];
    updated[index] = value;
    setLocations(updated);
  };

  const addLocation = () => {
    setLocations([...locations, ""]);
  };

  const getCoordinates = async (place) => {
    const res = await axios.get("https://api.openrouteservice.org/geocode/search", {
      params: { api_key: API_KEY, text: place },
    });
    if (!res.data.features.length) throw new Error(`No coordinates found for "${place}"`);
    return res.data.features[0].geometry.coordinates;
  };

  const applyRoute = (route) => {
    const coords = route.geometry.coordinates;
    const steps = route.properties.segments[0].steps;

    setCoordinates(coords);
    setInstructions(steps);
    setRouteInfo({
      distance: (route.properties.summary.distance / 1000).toFixed(2),
      duration: (route.properties.summary.duration / 60).toFixed(2),
    });
    setCurrentStep(0);
  };

  const handlePlanTrip = async () => {
    setLoading(true);
    try {
      const coords = await Promise.all(locations.map(getCoordinates));
      if (coords.length < 2) {
        alert("Please enter at least two valid locations.");
        setLoading(false);
        return;
      }

      let profile = "driving-car";
      if (mode === "walking") profile = "foot-walking";
      else if (mode === "cycling") profile = "cycling-regular";
      else if (["bus", "metro", "car"].includes(mode)) profile = "driving-car";

      const directionsRes = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
        {
          coordinates: coords,
          instructions: true,
        },
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      applyRoute(directionsRes.data.features[0]);
    } catch (err) {
      console.error("Directions API failed:", err);
      alert(`Failed to get optimized path: ${err.response?.data?.error?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    try {
      const userId = localStorage.getItem("userId") || 1;
      await axios.post("http://localhost:5000/save-trip", {
        userId,
        destinations: locations,
      });
      alert("Trip saved to history!");
    } catch (err) {
      alert("Failed to save trip");
      console.error(err);
    }
  };

  const simulateNavigation = () => {
    if (!instructions.length) return;
    setPreviewing(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= instructions.length) {
        clearInterval(interval);
        setPreviewing(false);
        speak("You have reached your destination.");
        return;
      }
      const step = instructions[i];
      speak(step.instruction);
      setCurrentStep(i);
      i++;
    }, 5000);
  };

  const startIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const endIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return (
    <div style={{ display: "flex", padding: 20 }}>
      <div style={{ flex: 1, marginRight: 20 }}>
        <h2>Trip Planner</h2>
        {locations.map((loc, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <input
              value={loc}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Enter location ${index + 1}`}
              style={{ padding: "5px", width: "80%" }}
              disabled={loading}
            />
            {loc && <Weather city={loc} />}
          </div>
        ))}
        <label>Travel Mode: </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={loading}>
          <option value="car">Car</option>
          <option value="bus">Bus</option>
          <option value="metro">Metro</option>
          <option value="walking">Walking</option>
          <option value="cycling">Cycling</option>
        </select>
        <br /><br />
        <label>
          🔊 Voice Directions: {" "}
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={() => setVoiceEnabled(!voiceEnabled)}
            disabled={loading}
          />
        </label>
        <br />
        <label>
          Filter Hazards: {" "}
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All</option>
            <option value="flood">Flood</option>
            <option value="accident">Accident</option>
            <option value="blockage">Blockage</option>
          </select>
        </label>
        <br />
        <button onClick={addLocation} disabled={loading}>➕ Add Destination</button>{" "}
        <button onClick={handlePlanTrip} disabled={loading}>
          {loading ? "Planning..." : "🗺 Plan Trip"}
        </button>{" "}
        <button onClick={handleSaveTrip} disabled={loading}>💾 Save Trip</button>{" "}
        <button onClick={() => navigate("/trip-history")} disabled={loading}>📜 View Trip History</button>
        <button onClick={() => setReportingHazard(true)} style={{ backgroundColor: "orange", marginTop: 10 }}>
          ⚠️ Report Hazard
        </button>
        {instructions.length > 0 && (
          <button onClick={simulateNavigation} disabled={previewing || loading}>
            🚗 Start Preview Navigation
          </button>
        )}
        {loading && <div style={{ marginTop: 20 }}><strong>Loading route, please wait...</strong></div>}
        {routeInfo && !loading && (
          <div style={{ marginTop: 20 }}>
            <h3>Trip Summary</h3>
            <p>📏 Distance: {routeInfo.distance} km</p>
            <p>⏱ Duration: {routeInfo.duration} mins</p>
            <h4>Turn-by-Turn Directions:</h4>
            <ol>
              {instructions.map((step, idx) => (
                <li
                  key={idx}
                  style={{
                    fontWeight: currentStep === idx ? "bold" : "normal",
                    color: currentStep === idx ? "blue" : "black",
                  }}
                >
                  {step.instruction} ({step.distance.toFixed(0)} m)
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div style={{ flex: 2 }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "500px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds coordinates={coordinates} />
          <MapEvents />
          {coordinates.length > 1 && (
            <Polyline positions={coordinates.map(([lng, lat]) => [lat, lng])} color="blue" />
          )}
          {coordinates.length > 0 && (
            <>
              <Marker position={[coordinates[0][1], coordinates[0][0]]} icon={startIcon} />
              <Marker position={[coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]]} icon={endIcon} />
            </>
          )}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>Your Current Location</Popup>
            </Marker>
          )}
          {hazards
            .filter(h => filterType === "all" || h.type === filterType)
            .map(hazard => (
              <Marker
                key={hazard.id}
                position={[hazard.latitude, hazard.longitude]}
                icon={hazardIcon}
                eventHandlers={{ click: () => setActiveHazard(hazard.id) }}
              >
                <Popup
                  onClose={() => setActiveHazard(null)}
                  autoClose={false}
                  closeOnClick={false}
                  open={activeHazard === hazard.id}
                >
                  <div>
                    <strong>{hazard.type.toUpperCase()}</strong> <br />
                    Verified by: {hazard.verified_by}<br />
                    Reported at: {new Date(hazard.timestamp).toLocaleString()}<br />
                    <button onClick={() => confirmHazard(hazard.id)}>✅ Confirm</button>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TripPlanner;
