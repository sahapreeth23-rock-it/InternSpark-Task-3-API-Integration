
// Get HTML elements
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const weatherResult = document.getElementById("weather-result");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

// Convert weather codes into descriptions and icons
function getWeatherInfo(code) {
    if (code === 0) {
        return { description: "Clear sky", icon: "☀️" };
    } else if (code === 1) {
        return { description: "Mainly clear", icon: "🌤️" };
    } else if (code === 2) {
        return { description: "Partly cloudy", icon: "⛅" };
    } else if (code === 3) {
        return { description: "Overcast", icon: "☁️" };
    } else if ([45, 48].includes(code)) {
        return { description: "Foggy", icon: "🌫️" };
    } else if ([51, 53, 55, 56, 57].includes(code)) {
        return { description: "Drizzle", icon: "🌦️" };
    } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { description: "Rainy", icon: "🌧️" };
    } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { description: "Snowy", icon: "❄️" };
    } else if ([95, 96, 99].includes(code)) {
        return { description: "Thunderstorm", icon: "⛈️" };
    } else {
        return { description: "Weather conditions unavailable", icon: "🌍" };
    }
}

// Handle the city search form
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    // Clear previous messages and results
    errorMessage.textContent = "";
    weatherResult.hidden = true;

    if (!city) {
        errorMessage.textContent = "Please enter a city name.";
        return;
    }

    loading.hidden = false;

    try {
        // Step 1: Find the city coordinates
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the spelling and try again.");
        }

        const location = geoData.results[0];

        // Step 2: Fetch weather using latitude and longitude
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather data. Please try again.");
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
            throw new Error("Weather data is currently unavailable.");
        }

        // Step 3: Get the current weather details
        const current = weatherData.current;
        const info = getWeatherInfo(current.weather_code);

        // Step 4: Display the weather
        cityName.textContent =
            `${location.name}, ${location.country}`;

        weatherIcon.textContent = info.icon;

        temperature.textContent =
            `${Math.round(current.temperature_2m)}°C`;

        weatherDescription.textContent = info.description;

        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${current.wind_speed_10m} km/h`;

        weatherResult.hidden = false;

    } catch (error) {
        errorMessage.textContent = error.message ||
            "Something went wrong. Please try again.";
    } finally {
        loading.hidden = true;
    }
});