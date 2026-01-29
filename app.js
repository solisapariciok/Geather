const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const resultDiv = document.getElementById("result");

// Map weather codes to conditions (Open-Meteo)
const weatherCodes = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Drizzle light",
  53: "Drizzle moderate",
  55: "Drizzle dense",
  56: "Freezing drizzle light",
  57: "Freezing drizzle dense",
  61: "Rain slight",
  63: "Rain moderate",
  65: "Rain heavy",
  66: "Freezing rain light",
  67: "Freezing rain heavy",
  71: "Snow slight",
  73: "Snow moderate",
  75: "Snow heavy",
  77: "Snow grains",
  80: "Rain showers slight",
  81: "Rain showers moderate",
  82: "Rain showers violent",
  85: "Snow showers slight",
  86: "Snow showers heavy",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail"
};

searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    resultDiv.innerHTML = "⚠️ Please enter a city name";
    return;
  }

  resultDiv.innerHTML = "Loading...";

  try {
    // 1️⃣ Get coordinates
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      resultDiv.innerHTML = "❌ City not found";
      return;
    }

    const { latitude, longitude, name } = geoData.results[0];

    // 2️⃣ Determine which page we are on
    const isTempPage = window.location.pathname.includes("temperature");

    let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const weatherRes = await fetch(url);
    const weatherData = await weatherRes.json();

    const daily = weatherData.daily;

    // 3️⃣ Display data
    resultDiv.innerHTML = "";

    for (let i = 0; i < daily.time.length; i++) {
      const date = daily.time[i];
      let content = "";

      if (isTempPage) {
        content = `
          <p>🌡 ${date}: Max ${daily.temperature_2m_max[i]}°C, Min ${daily.temperature_2m_min[i]}°C</p>
        `;
      } else {
        const code = daily.weathercode[i];
        content = `
          <p>🌦 ${date}: ${weatherCodes[code] || "Unknown"}</p>
        `;
      }

      const card = document.createElement("div");
      card.className = "weather-card";
      card.innerHTML = content;
      resultDiv.appendChild(card);
    }

  } catch (err) {
    resultDiv.innerHTML = "❌ Error fetching weather data";
    console.error(err);
  }
});
