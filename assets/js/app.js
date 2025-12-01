// Dayjs Plugins
dayjs.extend(window.dayjs_plugin_customParseFormat);
dayjs.extend(dayjs_plugin_relativeTime);

///Global DOM variables
//loading
let loadingIndicator;

//weather card
let weatherCard;
let weatherLocation;
let temperature;
let condition;
let weatherIcon;
let changeLocationBtn;

let searchEventsBtn;
let searchFlightsBtn;
let searchHotelsBtn;

let localFoodBtn;
let localTransportationBtn;
let essentialsBtn;
let checkWeatherBtn;

let resultsTitle;
let resultsContent;
let planBtn;

let currentTripContainer;
let completeTripBtn;
let pastTripContainer;
let clearHistoryBtn;

let eventModal;
let flightModal;
let hotelModal;
let locationModal;
let tripNameBtn;

let eventSearchForm;
let flightSearchForm;
let hotelSearchForm;
let locationForm;
let tripNameForm;

let detectedLocation = null; //stores lat and long from geolocator, or user entry
let currentResults = []; //stores local searchs

let selectedItems = new Set();

let currentSearchType = null;

let currentTrip = []; //array of items for current trip
let pendingModalAction = null;

console.log("DayAway is initializing...");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM objects are initializing...");
  initializeApp();
  setupEventListener();
  detectUserLocation();
  loadPastTrips();

  console.log("App initialization successful!");
});

function initializeApp() {
  loadingIndicator = document.getElementById("loading-indicator");

  weatherCard = document.getElementById("weather-card");
  weatherLocation = document.getElementById("weather-location");
  temperature = document.getElementById("temp");
  condition = document.getElementById("current-cond");
  weatherIcon = document.getElementById("weather-icon");
  changeLocationBtn = document.getElementById("location-change-btn");

  searchHotelsBtn = document.getElementById("check-hotels");
  searchEventsBtn = document.getElementById("search-events-btn");
  searchFlightsBtn = document.getElementById("search-flights-btn");

  localTransportationBtn = document.getElementById("local-transport-btn");
  localFoodBtn = document.getElementById("local-food-btn");
  checkWeatherBtn = document.getElementById("weather-change-btn");
  essentialsBtn = document.getElementById("essentials-btn");

  resultsTitle = document.getElementById("result-title");
  resultsContent = document.getElementById("results-content");
  planBtn = document.getElementById("plan-trip");

  currentTripContainer = document.getElementById("current-trip-container");
  completeTripBtn = document.getElementById("complete-trip-btn");
  pastTripContainer = document.getElementById("past-trip-container");
  clearHistoryBtn = document.getElementById("clear-history-btn");

  eventModal = document.getElementById("event-modal");
  flightModal = document.getElementById("flight-modal");
  hotelModal = document.getElementById("hotel-modal");
  locationModal = document.getElementById("location-modal");
  tripNameModal = document.getElementById("trip-name-modal");

  eventSearchForm = document.getElementById("event-search-form");
  flightSearchForm = document.getElementById("flight-search-form");
  hotelSearchForm = document.getElementById("hotel-search-form");
  locationForm = document.getElementById("location-form");
  tripNameForm = document.getElementById("trip-name-form");

  console.log("DOM elements Initialized!");
}

function setupEventListener() {
  if (searchEventsBtn) {
    searchEventsBtn.addEventListener("click", () => openModal("event-modal"));
  }

  if (searchFlightsBtn) {
    searchFlightsBtn.addEventListener("click", () => openModal("flight-modal"));
  }

  if (searchHotelsBtn) {
    searchHotelsBtn.addEventListener("click", () => openModal("hotel-modal"));
  }

  //Quick-action-btn
  if (localFoodBtn) {
    localFoodBtn.addEventListener("click", () => {
      pendingModalAction = "food";
      document.getElementById("location-modal-title").textContent =
        "Search Local Food";
      openModal("location-modal");
    });
  }

  if (localTransportationBtn) {
    localTransportationBtn.addEventListener("click", () => {
      pendingModalAction = "transportation";
      document.getElementById("location-modal-title").textContent =
        "Search Transportation";
      openModal("location-modal");
    });
  }

  if (essentialsBtn) {
    essentialsBtn.addEventListener("click", () => {
      pendingModalAction = "essentials";
      document.getElementById("location-modal-title").textContent =
        "Find Essentials";
      openModal("location-modal");
    });
  }

  if (checkWeatherBtn) {
    checkWeatherBtn.addEventListener("click", () => {
      pendingModalAction = "weather";
      document.getElementById("location-modal-title").textContent =
        "Check Weather";
      openModal("location-modal");
    });
  }

  if (changeLocationBtn) {
    changeLocationBtn.addEventListener("click", () => {
      pendingModalAction = "weather";
      document.getElementById("location-modal-title").textContent =
        "Change Location";
      openModal("location-modal");
    });
  }

  // document.querySelectorAll("[data-modal]").forEach((btn) => {
  //   btn.addEventListener("click", (e) => {
  //     const modalId = e.target.getAttribute("data-modal");
  //     closeModal(modalId);
  //   });
  // });

  document.querySelectorAll(".cancel-modal").forEach((btn) => {
    btn.addEventListener("click", function (event) {
      closeModal(event.target.getAttribute("data-modal"));
    });
  });

  if (eventSearchForm) {
    eventSearchForm.addEventListener("submit", handleEventSearch);
  }

  if (flightSearchForm) {
    flightSearchForm.addEventListener("submit", handleFlightSearch);
  }

  if (hotelSearchForm) {
    hotelSearchForm.addEventListener("submit", handleHotelSearch);
  }

  if (locationForm) {
    locationForm.addEventListener("submit", handleLocationSearch);
  }

  if (tripNameForm) {
    tripNameForm.addEventListener("submit", handleSaveTrip);
  }

  document.querySelectorAll(".use-geo-btn").forEach((btn) => {
    btn.addEventListener("click", handleUseGeoLocation);
  });

  if (planBtn) {
    planBtn.addEventListener("click", handleAddToTrip);
  }

  if (completeTripBtn) {
    completeTripBtn.addEventListener("click", handleCompleteTrip);
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", handleClearHistory);
  }

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id);
    }
  });

  console.log("Event listeners activated");
}

async function detectUserLocation() {
  console.log("Detecting location....");

  if (weatherLocation) {
    weatherLocation.textContent = "Detecting Location....";
  }

  try {
    const coords = await getCurrentLocation();
    console.log("Location Detected!!", coords);

    detectedLocation = {
      lat: coords.lat,
      lng: coords.lng,
      coords: `${coords.lat}, ${coords.lng}`,
    };

    const weatherData = await fetchWeather(detectedLocation.coords, 3);

    detectedLocation.city = weatherData.location.name;

    updateWeatherCard(weatherData);

    console.log(`Weather updated for:`, detectedLocation.city);
  } catch (error) {
    console.log(
      "Geolocation unavailable, Please enter location",
      error.message
    );

    if (weatherLocation) {
      weatherLocation.textContent =
        "Location not detected, manual entry required";
    }
    if (temperature) {
      temperature.textContent = "--°";
    }
    if (condition) {
      condition.textContent = 'Click "Change Location To set manually';
    }
  }
}

function updateWeatherCard(data) {
  if (weatherLocation) {
    weatherLocation.textContent = `${data.location.name}, ${data.location.region}`;
  }

  if (temperature) {
    temperature.textContent = `${Math.round(data.current.temp_f)}°F`;
  }

  if (condition) {
    condition.textContent = data.current.condition.text;
  }

  if (weatherIcon) {
    weatherIcon.innerHTML = `<img src="https://${data.current.condition.icon}" alt="${data.current.condition.text}">`;
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    console.log(`${modalId} Opened successfully`);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modalId) {
    modal.classList.remove("active");

    const form = modal.querySelector("form");
    if (form) {
      form.reset();
    }

    console.log(`${modalId} has been closed`);
  }
}

async function handleUseGeoLocation(event) {
  const targetInputId = event.target.getAttribute("data-target");
  const targetInput = document.getElementById(targetInputId);

  if (!targetInput) return;

  try {
    event.target.textContent = `Getting Location...`;
    event.target.disabled = true;

    const coords = await getCurrentLocation();

    targetInput.value = `${coords.lat}, ${coords.lng}`;

    event.target.textContent = "Location Detected!!";

    setTimeout(() => {
      event.target.textContent = "Use My Location";
      event.target.disabled = false;
    }, 2000);
  } catch (error) {
    alert("Unable to detect Location: " + error.message);
    event.target.textContent = "Use My Location";
    event.target.disabled = false;
  }
}

async function handleEventSearch(event) {
  event.preventDefault();

  const eventType = document.getElementById("event-type-input").value.trim();
  let location = document.getElementById("event-location-input").value.trim();

  if (!eventType) {
    alert("Please enter an event type");
    return;
  }

  if (!location) {
    if (detectedLocation) {
      location = detectedLocation.coords || detectedLocation.city;
      console.log(`${location} is your current location`);
    } else {
      alert("Please enter a location, or enable Geolocation services");
      return;
    }
  }

  closeModal("event-modal");

  try {
    showLoading(true);

    console.log(`Looking for ${eventType}, in ${location}....`);
    const data = await fetchEvents(eventType, location);

    console.log("Events API response:", data);
    console.log("Available properties:", Object.keys(data));

    currentResults = data.events_results || data.event_results || [];
    currentSearchType = "events";

    displayEventResults(data, eventType, location);

    if (planBtn && currentResults.length > 0) {
      planBtn.style.display = "block";
    }

    console.log("Found", currentResults.length, "events near you");
  } catch (error) {
    console.error("Event search error", error);
    alert("Event search failed: " + error.message);
  } finally {
    showLoading(false);
  }
  clearSelections();
}

async function handleFlightSearch(event) {
  event.preventDefault();

  const origin = document.getElementById("flight-origin").value;
  const destination = document.getElementById("flight-destination").value;
  const outbound = document.getElementById("flight-outbound").value;
  const returnDate = document.getElementById("flight-return").value;

  if (!destination && !origin) {
    alert("Please enter an origin and a destination");
    return;
  }

  if (!outbound) {
    alert("Please enter a date for departure");
    return;
  }

  closeModal("flight-modal");

  try {
    showLoading(true);
    console.log(
      `Searching for flights leaving ${origin} heading to ${destination} on ${outbound}`
    );
    const data = await fetchFlights(origin, destination, outbound, returnDate);

    console.log("Flights API response:", data);
    console.log("Available properties:", Object.keys(data));

    currentResults = data.best_flights || data.other_flights || [];
    currentSearchType = "flight";

    displayFlightResults(data, origin, destination);

    if (planBtn && currentResults.length > 0) {
      planBtn.style.display = "block";
    }

    console.log(`${currentResults.length} flights match search`);
  } catch (error) {
    console.error("Could not display flight info", error);
    alert("Flight search failed: " + error.message);
  } finally {
    showLoading(false);
  }

  clearSelections();
}

async function handleHotelSearch(event) {
  event.preventDefault();

  let location = document.getElementById("hotel-location").value.trim();
  const checkIn = document.getElementById("hotel-checkin").value;
  const checkOut = document.getElementById("hotel-checkout").value;

  if (!location) {
    if (detectedLocation) {
      location = detectedLocation.coords || detectedLocation.city;
      console.log(`${location} is your current location`);
    } else {
      alert("Enter a location or enable geolocation detection");
      return;
    }
  }

  if (!checkIn || !checkOut) {
    alert("Please enter a check-in date and a check-out date");
    return;
  }

  closeModal("hotel-modal");

  try {
    showLoading(true);
    console.log(`Searching for hotels in ${location}`);

    const data = await fetchHotelPrices(location, checkIn, checkOut);

    currentResults = data.properties || [];
    currentSearchType = "hotel";

    displayHotelResults(data, location, checkIn, checkOut);

    console.log("Results: ", data);
    if (planBtn && currentResults.length > 0) {
      planBtn.style.display = "block";
    }

    console.log(`${currentResults.length} hotels found matching search`);
  } catch (error) {
    console.error("Unable to display hotel information");
  } finally {
    showLoading(false);
  }

  clearSelections();
}

async function handleLocationSearch(event) {
  event.preventDefault();

  let location = document.getElementById("simple-location-input").value.trim();

  if (!location) {
    if (detectedLocation) {
      location = detectedLocation.coords || detectedLocation.city;
      console.log(`${location} is your current location`);
    } else {
      alert("Please turn on geolocation services or enter a location");
      return;
    }
  }

  closeModal("location-modal");

  try {
    showLoading(true);

    switch (pendingModalAction) {
      case "food":
        await searchLocalFood(location);
        break;
      case "transportation":
        await searchLocalTransportation(location);
        break;
      case "essentials":
        await searchEssentials(location);
        break;
      case "weather":
        await searchWeather(location);
        break;
      default:
        throw new Error("Unknown Action");
    }
  } catch (error) {
    console.error(`local search error: ${error}`);
    alert("Search Failed");
  } finally {
    showLoading(false);
    pendingModalAction = null;
  }
}

async function searchLocalFood(location) {
  console.log(`Searching for food near ${location}`);
  const data = await fetchLocalFood(location);

  currentResults = data.local_results || [];
  currentSearchType = "food";

  displayLocalResults(data, "Local Food", location);

  if (planBtn && currentResults.length > 0) {
    planBtn.style.display = "block";
  }

  clearSelections();
}

async function searchLocalTransportation(location) {
  console.log(`Searching for public transportation in ${location}`);
  const data = await fetchLocalTransportation(location);

  currentResults = data.local_results || [];
  currentSearchType = "transportation";

  displayLocalResults(data, "Local Transportation", location);

  if (planBtn && currentResults.length > 0) {
    planBtn.style.display = "block";
  }

  clearSelections();
}

async function searchEssentials(location) {
  console.log(`Looking for Essentials in ${location}`);
  const data = await fetchEssentials(location);

  currentResults = data.local_results || [];
  currentSearchType = "essentials";

  displayLocalResults(data, "Essentials", location);

  if (planBtn && currentResults.length > 0) {
    planBtn.style.display = "block";
  }

  clearSelections();
}

async function searchWeather(location) {
  console.log(`Checking weather forecast for ${location}`);
  const data = await fetchWeather(location, 5);

  updateWeatherCard(data);

  displayWeatherResults(data);
}

function displayEventResults(data, eventType, location) {
  if (resultsTitle) {
    resultsTitle.textContent = `${eventType} in ${location} found`;
  }

  if (resultsContent) {
    resultsContent.innerHTML = "";
  }

  const events = data.events_results || data.event_results || [];

  if (events.length === 0) {
    resultsContent.innerHTML = '<p class="placeholder">No events found</p>';
    return;
  }

  events.forEach((event, index) => {
    const card = createEventCard(event, index);
    resultsContent.appendChild(card);
  });
}

function createEventCard(event, index) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.dataset.itemIndex = index;

  const title = event.title || "event";
  const date = event.date?.when || "Date TBA";
  const venue = event.address?.[0] || "Venue TBA";
  const thumbnail = event.image || "";

  const isSelected = selectedItems.has(index);

  card.innerHTML = `
  ${thumbnail ? `<img src="${thumbnail}" alt="${title}">` : ""}
  <div class="card-content">
    <h4 class="card-title">${title}</h4>
    <p class="card-info">${date}</p>
    <p class="card-info">${venue}</p>
    ${
      event.link
        ? `<a href="${event.link}" target="_blank" class="card-link">More Information</a>`
        : ""
    }
    <button class="select-item-btn ${
      isSelected ? "selected" : ""
    }" data-item-index="${index}">
      ${isSelected ? "✓ Selected" : "Select this"} 
    </button>
    </div>
  `;

  const selectBtn = card.querySelector(".select-item-btn");
  selectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleItemSelection(index, card);
  });

  return card;
}

function displayFlightResults(data, origin, destination) {
  if (resultsTitle) {
    resultsTitle.textContent = `Flights: ${origin} to ${destination}`;
  }

  if (resultsContent) {
    resultsContent.innerHTML = "";
  }

  const flights = data.best_flights || data.other_flights || [];

  if (flights.length === 0) {
    resultsContent.innerHTML = `<P class="placeholder">No Flights Found</p>`;
    return;
  }

  flights.forEach((flight, index) => {
    const card = createFlightCard(flight, index);
    resultsContent.appendChild(card);
  });
}

function createFlightCard(flight, index) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.dataset.itemIndex = index;

  const flights = flight.flights || [];
  const firstFlight = flights[0] || {};
  const isSelected = selectedItems.has(index);
  let allFlights = "";

  for (let singleFlight of flights) {
    allFlights += `<p class="card-info airline-margin-top"><span class="airport-names">${
      singleFlight.departure_airport?.name || "origin"
    }</span> → <span class="airport-names">${
      singleFlight.arrival_airport?.name || "Destination"
    }</span></p>
    <p>Flight Number: <span class="airport-names">${
      singleFlight.flight_number
    }</span></p>
      <p class="card-info">${dayjs(
        singleFlight.departure_airport?.time || "--"
      ).format("ddd MMM DD, YYYY h:mm a")} to ${dayjs(
      singleFlight.arrival_airport?.time || "--"
    ).format("ddd MMM DD, YYYY h:mm a")}</p>`;
  }

  card.innerHTML = `
    <div class="card-content">
      <h4 class="card-title">${firstFlight.airline || "Flight"}</h4>
      ${allFlights}
      ${
        flight.price
          ? `<p class="card-info"><span class="airport-price">$${flight.price}</p>`
          : ""
      }</span>
      ${
        flight.booking_token
          ? `<a href="#" class="card-link">Book Flight</a>`
          : ""
      }
      <button class="select-item-btn ${isSelected ? "selected" : ""}"
      data-item-index="${index}">
        ${isSelected ? "✓ Selected" : "Select This"}
      </button>
    </div>
  `;

  const selectBtn = card.querySelector(".select-item-btn");
  selectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleItemSelection(index, card);
  });

  return card;
}

function displayHotelResults(data, location) {
  if (resultsTitle) {
    resultsTitle.textContent = `Hotels in ${location}`;
  }

  if (resultsContent) {
    resultsContent.innerHTML = "";
  }

  const hotels = data.properties || [];

  if (hotels.length === 0) {
    resultsContent.innerHTML = `<p class="placeholder">No hotels Located near ${location}</p>`;
    return;
  }

  hotels.forEach((hotel, index) => {
    const card = createHotelCard(hotel, index);
    resultsContent.appendChild(card);
  });
}

function createHotelCard(hotel, index) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.dataset.itemIndex = index;

  const isSelected = selectedItems.has(index);

  card.innerHTML = `
  ${
    hotel.images?.[0]
      ? `<img src="${hotel.images[0]}" alt="${hotel.name}">`
      : ""
  }
  <div class="card-content">
    <h4 class="card-title">${hotel.name || "Hotel"}</h4>
    ${
      hotel.rate_per_night
        ? `<p class="card-info">${hotel.rate_per_night.lowest}/night</p>`
        : ""
    }
    ${
      hotel.overall_rating
        ? `<p class="card-info"> ${hotel.overall_rating}</p>`
        : ""
    }
    ${
      hotel.link
        ? `<a href="${hotel.link}" target="_blank" class="card-link"> View Hotel</a>`
        : ""
    }
    <button class="select-item-btn ${
      isSelected ? "selected" : ""
    }" data-item-index="${index}">
      ${isSelected ? "✓ Selected" : "Select This"}
    </button>
  </div>
  `;

  const selectBtn = card.querySelector(".select-item-btn");
  selectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleItemSelection(index, card);
  });

  return card;
}

function displayLocalResults(data, title, location) {
  if (resultsTitle) {
    resultsTitle.textContent = `${title} in ${location}`;
  }

  if (resultsContent) {
    resultsContent.innerHTML = "";
  }
  const results = data.local_results || [];

  if (results.length === 0) {
    resultsContent.innerHTML = `<p class="placeholder">No results found</p>`;
    return;
  }

  results.forEach((result, index) => {
    const card = createLocalCard(result, index);
    resultsContent.appendChild(card);
  });
}

function createLocalCard(result, index) {
  const card = document.createElement("div");
  card.className = "result-card";
  card.dataset.itemIndex = index;

  const isSelected = selectedItems.has(index);

  card.innerHTML = `
    <div class="card-content">
      <h4 class="card-title">${result.title || result.name || "Place"}</h4>
      ${result.type ? `<p class="card-info">${result.type}</p>` : ""}
      ${result.rating ? `<p class="card-info">${result.rating}</p>` : ""}
      ${result.address ? `<p class="card-info">${result.address}</p>` : ""}
      ${result.phone ? `<p class="card-info">${result.phone}</p>` : ""}
      <button class="select-item-btn ${
        isSelected ? "selected" : ""
      }" data-item-index="${index}">
        ${isSelected ? "✓ Selected" : "Select This"}
      </button>
    </div>
  `;

  const selectBtn = card.querySelector(".select-item-btn");
  selectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleItemSelection(index, card);
  });

  return card;
}

function displayWeatherResults(data) {
  if (resultsTitle) {
    resultsTitle.textContent = `Weather: ${data.location.name}`;
  }

  if (resultsContent) {
    resultsContent.innerHTML = "";
  }
  const forecastDays = data.forecast?.forecastDay || [];

  forecastDays.forEach((day) => {
    const card = createWeatherCard(day);
    resultsContent.appendChild(card);
  });
}

function createWeatherCard(day) {
  const card = document.createElement("div");
  card.className = "result-card";

  const date = new Date(day.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  card.innerHTML = `
    <div class="card-content">
      <h4 class="card-title">${date}</h4>
      <img src="https://${day.day.condition.icon}" alt="${
    day.day.condition.text
  }" style="width:64px;">
      <p class="card-info">${day.day.condition.text}</p>
      <p class="card-info">🌡️High:${Math.round(day.day.maxtemp_f)}°F</p>
      <p class="card-info">🌡️Low:${Math.round(day.day.mintemp_f)}°F</p>
    </div>
  `;
  return card;
}

function toggleItemSelection(index, card) {
  if (!selectedItems.has(index)) {
    selectedItems.add(index);
    const btn = card.querySelector(".select-item-btn");
    btn.textContent = "✓ Selected";
    btn.classList.add("selected");
    console.log(`Item ${index} selected`);
  } else {
    selectedItems.delete(index);
    const btn = card.querySelector(".select-item-btn");
    btn.textContent = "Select this";
    btn.classList.remove("selected");
    console.log(`Item ${index} was unselected`);
  }

  updatePlanButtonText();
}

function updatePlanButtonText() {
  if (!planBtn) return;

  if (selectedItems.size === 0) {
    planBtn.textContent = "Add plans to current trip";
  } else if (selectedItems.size === 1) {
    planBtn.textContent = `Add ${selectedItems.size} item to trip`;
  } else {
    planBtn.textContent = `Add ${selectedItems.size} items to trip`;
  }
}

function clearSelections() {
  selectedItems.clear();
  console.log("Selctions hae been cleared");
}

function handleAddToTrip() {
  if (selectedItems.size === 0) {
    alert("Please make at least one selection to add to the trip");
    return;
  }

  if (currentResults.length === 0) {
    alert("No results to add");
    return;
  }

  const itemsToAdd = Array.from(selectedItems).map(
    (index) => currentResults[index]
  );

  if (selectedItems.size > 1) {
    const confirmMessage = `You have selected ${selectedItems.size} items.  Add all to your trip?`;
    if (!confirm(confirmMessage)) {
      return;
    }
  }

  itemsToAdd.forEach((item, idx) => {
    const tripItem = {
      id: Date.now() + idx,
      type: currentSearchType,
      title: getItemTitle(item, currentSearchType),
      results: [item],
      timestamp: new Date().toISOString(),
    };

    currentTrip.push(tripItem);
  });

  if (completeTripBtn) {
    completeTripBtn.style.display = "block";
  }

  displayCurrentTrip();

  clearSelections();
  updatePlanButtonText();

  alert(`Added ${itemsToAdd.length} items to your trip!`);
  console.log(`Added ${itemsToAdd.length} items to your trip`);
}

function getItemTitle(item, type) {
  switch (type) {
    case "events":
      return item.title || "Event";
    case "flight":
      const flight = item.flights?.[0];
      return `${flight?.airline || "Flight"} ${
        flight?.departure_airport?.id || ""
      } → ${flight?.arrival_airport?.id || ""}`;
    case "hotel":
      return item.name || "Hotel";
    case "food":
    case "transportation":
    case "essentials":
      return item.title || item.name || "Location";
    default:
      return "Trip Item";
  }
}

function displayCurrentTrip() {
  if (!currentTripContainer) return;

  currentTripContainer.innerHTML = "";

  if (currentTrip.length === 0) {
    currentTripContainer.innerHTML = `<p class="placeholder">No items added to trip yet</p>`;
    if (completeTripBtn) {
      completeTripBtn.style.display = "none";
    }
    return;
  }
  //localStorage.getItem(tripItem, currentTrip);
  currentTrip.forEach((item) => {
    const tripCard = createTripItemCard(item);
    currentTripContainer.appendChild(tripCard);
  });
}

function createTripItemCard(item) {
  const card = document.createElement("div");
  card.className = "trip-item";

  const icon = getTripItemIcon(item.type);
  const count = item.results.length;

  card.innerHTML = `
    <div class="trip-item-info">
      <div class="trip-item-title">${icon} ${item.title}</div>
      <div class="trip-item-details">${count} item${
    count !== 1 ? "s" : ""
  }</div>
    </div>
    <button class="trip-item-remove" data-item-id="${item.id}">Remove</button>
  `;

  const removeBtn = card.querySelector(".trip-item-remove");
  removeBtn.addEventListener("click", () => removeTripItem(item.id));

  return card;
}

function getTripItemIcon(type) {
  const icons = {
    events: "🎉",
    flights: "✈️",
    hotels: "🏨",
    food: "🍽️",
    transportation: "🚇",
    essentials: "⚡",
    weather: "🌤️",
  };
  return icons[type] || "📍";
}

function removeTripItem(itemId) {
  currentTrip = currentTrip.filter((item) => item.id !== itemId);
  displayCurrentTrip();
}

function handleCompleteTrip() {
  if (currentTrip.length === 0) {
    alert("Add items to your trip first!");
    return;
  }

  openModal("trip-name-modal");
}

function handleSaveTrip(event) {
  event.preventDefault();

  const tripName = document.getElementById("trip-name-input").value.trim();
  const tripNotes = document.getElementById("trip-notes").value.trim();

  if (!tripName) {
    alert("Please name your trip");
    return;
  }

  const completedTrip = {
    id: Date.now(),
    name: tripName,
    notes: tripNotes,
    items: [...currentTrip],
    completedDate: new Date().toISOString(),
    itemCount: currentTrip.length,
  };

  saveToPastTrips(completedTrip);

  currentTrip = [];
  displayCurrentTrip();

  closeModal("trip-name-modal");

  alert(`Trip: "${tripName} has been logged into trips!!!`);

  console.log("Trip Planned:", tripName);
}

function saveToPastTrips(trip) {
  try {
    const pastTrips = JSON.parse(
      localStorage.getItem("dayawayPastTrips") || "[]"
    );

    pastTrips.unshift(trip);

    const trimmed = pastTrips.slice(0, 20);

    localStorage.setItem("dayawayPastTrips", JSON.stringify(trimmed));

    loadPastTrips();
  } catch (error) {
    console.error("Failed to save trip:", error);
    alert("Failed to save trip to history");
  }
}

function loadPastTrips() {
  if (!pastTripContainer) return;

  try {
    const pastTrips = JSON.parse(
      localStorage.getItem("dayawayPastTrips") || "[]"
    );

    pastTripContainer.innerHTML = "";

    if (pastTrips.length === 0) {
      pastTripContainer.innerHTML = `<p class="placeholder">No past trips yet</p>`;
      return;
    }

    pastTrips.forEach((trip) => {
      const card = createPastTripCard(trip);
      pastTripContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load past trips:", error);
  }
}

function createPastTripCard(trip) {
  const card = document.createElement("div");
  card.className = "past-trip-card";

  const date = new Date(trip.completedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  card.innerHTML = `
    <div class="past-trip-name">${trip.name}</div>
    <div class="past-trip-date">Planned: ${date}</div>
    <div class="past-trip-count">${trip.itemCount} item${
    trip.itemCount !== 1 ? "s" : ""
  }</div>
  `;

  card.addEventListener("click", () => viewPastTrip(trip));

  return card;
}

function viewPastTrip(trip) {
  let details = `Trip: ${trip.name}\n`;
  details += `Planned: ${new Date(trip.completedDate).toLocaleDateString()}\n`;
  details += `Items: ${trip.itemCount}\n\n`;

  if (trip.notes) {
    details += `Notes: ${trip.notes}\n\n`;
  }

  trip.items.forEach((item, index) => {
    details += `${index + 1}. ${item.title} (${item.results.length} items)\n`;
  });

  alert(details);
}

function handleClearHistory() {
  if (
    !confirm(
      "Are you sure you want to clear all past trips? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    localStorage.removeItem("dayawayPastTrips");
    loadPastTrips();
    alert("Past trips have been cleared");
  } catch (error) {
    console.error("Failed to clear history", error);
  }
}

function showLoading(show) {
  if (loadingIndicator) {
    loadingIndicator.style.display = show ? "flex" : "none";
  }
}

console.log("App successfully loaded begin planning");
