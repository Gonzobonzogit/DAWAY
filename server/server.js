const express = require('express');

const app = express();

// HARDCODED API KEYS FOR CLASS PROJECT
const WEATHER_API_KEY = '3673c331c78041b6b54200444252811';
const SERP_API_KEY = '4ea8a68025300f4d6891c410fa6bfb1e36a9b819e91b634d3564023fe0a10cfa';
const PORT = 3000;

app.use(express.json());


app.use((req, res,next) =>{
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


//Serve static files in folder
app.use(express.static('../'));


//assign weather route
app.get('/api/weather', async(req, res) =>{
    try{
        const { location, days } = req.query;
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=${days}&aqi=no&alerts=no`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`WeatherAPI error:${response.status}`);
        const data = await response.json();
        res.json(data);
    }   catch (error) {
        console.error('WeatherAPI error', error);
        res.status(500).json({error: 'Failed to fetch weather data'})
    }
});




//Assign API route for events
app.get('/api/events', async (req, res) => {
    try{
        const { eventType, location } = req.query;
        const searchQuery = `${eventType} in ${location}`;
        const url = `https://serpapi.com/search.json?engine=google_events&q=${encodeURIComponent(searchQuery)}&hl=en&api_key=${SERP_API_KEY}`;

        console.log('Events API URL:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`SerpAPI event error: ${response.status}`);

        const data = await response.json();
        console.log('Events API response keys:', Object.keys(data));
        res.json(data);
        }catch (error) {
            console.error('EventAPI error:', error);
            res.status(500).json({ error: 'Failed to fetch event data'});
        }
});


//Assign route for flights
app.get('/api/flights', async (req, res)=> {
    try {
        const { origin, destination, outboundDate, returnDate } = req.query;
        let url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origin}&arrival_id=${destination}&outbound_date=${outboundDate}&currency=USD&hl=en&api_key=${SERP_API_KEY}`;

        if (returnDate) {
            url += `&return_date=${returnDate}`;
        }

        console.log('Flights API URL:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Flight API error: ${response.status}`)
        const data = await response.json();
        console.log('Flights API response keys:', Object.keys(data));
        res.json(data);
    }   catch (error) {
        console.error('Flights API error', error);
        res.status(500).json({error: 'Failed to fetch flight data'});
    }


});


//assign route for hotels
app.get('/api/hotels', async (req, res) => {
    try {
        const {location, checkInDate, checkOutDate } = req.query;
        const url = `https://serpapi.com/search.json?engine=google_hotels&q=hotels+near+${encodeURIComponent(location)}&check_in_date=${checkInDate}&check_out_date=${checkOutDate}&sort_by=8&api_key=${SERP_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Hotel API error:${response.status}`);
        const data = await response.json();
        res.json(data);
    }   catch (error) {
        console.error('Hotel API error', error);
        res.status(500).json({error: 'Failed to fetch hotel data'})
    }
});


//assign route for local
app.get('/api/local', async (req, res)=> {
    try {
        const { query, location } = req.query;
        const url = `https://serpapi.com/search.json?engine=google_local&q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&api_key=${SERP_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Local API error:${response.status}`);
        const data = await response.json();
        res.json(data);
    }   catch (error) {
        console.error('Local API Failed', error);
        res.status(500).json({error: 'Failed to find local data'})
    }
});


app.listen(PORT, () =>{
    console.log(`
╔════════════════════════════════════════╗
║   🚀 DayAway Server is Running! 🚀     ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}      ║
║  Status: Ready to accept requests      ║
╚════════════════════════════════════════╝
    `);
});