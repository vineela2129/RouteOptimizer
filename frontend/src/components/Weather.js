import React, { useState } from "react";
import axios from "axios";

const Weather = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const API_KEY = "ed9ddd58aa16e748564601d6634f1d50"; // 🔁 Replace this

  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      setWeather(res.data);
    } catch (err) {
      console.error("Weather fetch failed", err);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <button onClick={fetchWeather}>Check Weather for {city}</button>
      {weather && (
        <div>
          <p><b>{weather.name}</b></p>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Weather: {weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
