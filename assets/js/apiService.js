async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported, please enter a location"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        const errorMessage = {
          1: "Permission Denied",
          2: "Position Unavailable",
          3: "Timeout",
        };
        reject(new Error(errorMessage[error.code] || "Geolocation error"));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * fetch events from SerpApi
 * @param {string} eventType - concert, festival, etc
 * @param {string} location - City name or coordinates
 * @returns {Promise<Object>} retrieved event data
 */

async function fetchEvents(eventType, location) {
  const params = new URLSearchParams({
    eventType: eventType,
    location: location,
  });

  try {
    const response = await fetch(`/api/events?${params}`);

    if (!response.ok) {
      throw new Error("Unable to find local events, check API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Event data has failed, check API_KEY", error);
    throw error;
  }
}

/**
 * fetch weather from weatherapi
 * @param {string} location -City name or coordinates
 * @param {number} days - number of days in forecast
 * @returns {Promise<Object>}  returned weather data
 * */

async function fetchWeather(location, days = 5) {
  const params = new URLSearchParams({
    location: location,
    days: Math.min(days, 7),
  });

  try {
    const response = await fetch(`/api/weather?${params}`);

    if (!response.ok) {
      throw new Error(`Weather API error:${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchweather error:", error);
    throw error;
  }
}

/**
 *
 * @param {string} origin
 * @param {string} destination
 * @param {string} outboundDate
 * @param {string} returnDate
 * @returns {Promise<Object>} Returned flight data
 */
async function fetchFlights(
  origin,
  destination,
  outboundDate,
  returnDate = "2025-12-12"
) {
  const params = new URLSearchParams({
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    outboundDate: outboundDate,
  });
  if (returnDate) {
    params.append("returnDate", returnDate);
  }
  try {
    const response = await fetch(`/api/flights?${params}`);

    if (!response.ok) {
      throw new Error(`flights API error:${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("fetchFlights error:", error);
    throw error;
  }
}

/**
 *
 * @param {string} location
 * @param {string} checkIn
 * @param {string} checkOut
 * @returns {Promise<Object>} returned hotel data
 */

async function fetchHotelPrices(location, checkIn, checkOut) {
  const params = new URLSearchParams({
    location: location,
    checkInDate: checkIn,
    checkOutDate: checkOut,
  });

  try {
    const response = await fetch(`/api/hotels?${params}`);

    if (!response.ok) {
      throw new Error(`Hotels API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("fetchHotelPrices error:", error);
    return error;
  }
}

/**
 *
 * @param {string} location
 * @returns {Promise<Object>}returned restaurant data
 */

async function fetchLocalFood(location) {
  const query = `Restaurants near ${location}`;
  const params = new URLSearchParams({
    query: query,
    location: location,
  });

  try {
    const response = await fetch(`/api/local?${params}`);

    if (!response.ok) {
      throw new Error(
        "Check your API_KEY, I know theres at least a Mcdonalds around.",
        error
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("fetchLocalFood error:", error);
    throw error;
  }
}

/**
 *
 * @param {*} location - city or coordinates
 * @returns local transportation data is taxis, buses
 */

async function fetchLocalTransportation(location) {
  const query = `public transportation near ${location}`;
  const params = new URLSearchParams({
    location: location,
    query: query,
  });

  try {
    const response = await fetch(`/api/local?${params}`);

    if (!response.ok) {
      throw new Error(
        `No local transportation found, Looks like your walking!! ${response.status}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Check the API key, Before you start walking", error);
    throw error;
  }
}

/**
 *
 * @param {string} location
 * @returns {Promise<Object>} local gas station, pharamcys, other essentials
 */

async function fetchEssentials(location) {
  const query = `Gas stations, ATMs, pharmacies near ${location}`;

  const param = new URLSearchParams({
    query: query,
    location: location,
  });

  try {
    const response = await fetch(`/api/local?${param}`);

    if (!response.ok) {
      throw new Error(`Essentials error:${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("fetchEssentials error:", error);
    throw error;
  }
}

// Make functions globally accessible
window.fetchEvents = fetchEvents;
window.fetchFlights = fetchFlights;
window.fetchHotelPrices = fetchHotelPrices;
window.fetchLocalFood = fetchLocalFood;
window.fetchLocalTransportation = fetchLocalTransportation;
window.fetchWeather = fetchWeather;
window.getCurrentLocation = getCurrentLocation;
window.fetchEssentials = fetchEssentials;
