const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000; // Choose an appropriate port number

let hospitalsData = {}; // Placeholder for hospitals data

const apiKey = 'pk.eyJ1IjoiYWFuaWEiLCJhIjoiY2x0dGVhZnduMHFidjJrcDl1ZXltMXc1ciJ9.X2dUty73h2WbJSP16uZmEA'; // Replace with your actual Mapbox API key

app.use(express.json());

// GET endpoint to receive hospitals data from frontend
app.get('/hospitals', (req, res) => {
  hospitalsData = req.body; // Assuming frontend sends hospitals data in the request body
  res.status(200).send('Hospitals data received');
});

// POST endpoint to receive recommendation request from frontend
app.post('/recommendation', async (req, res) => {
  try {
    if (!hospitalsData.currentLocation || !hospitalsData.facilities) {
      return res.status(400).json({ error: 'Hospitals data not provided' });
    }

    const currentLocation = hospitalsData.currentLocation;
    const hospData = hospitalsData.facilities;

    const recommendation = await recommendNearestHospital(currentLocation[0], currentLocation[1], hospData);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getTravelTime(startLat, startLng, endLat, endLng) {
  const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?access_token=${apiKey}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.routes[0].duration / 60; // Travel time in minutes
  } catch (error) {
    console.error('Error fetching travel time:', error.message);
    return Infinity; // Return a large value if there's an error
  }
}

async function recommendNearestHospital(currentLat, currentLng, hospData) {
  let nearestHospital = null;
  let shortestTotalTime = Infinity;
  const additionalHospitals = [];

  const recommendation = {
    recommendation: null,
    additional: []
  };

  for (const hospital of hospData) {
    const travelTime = await getTravelTime(currentLat, currentLng, hospital.latitude, hospital.longitude);
    const totalTime = hospital.waitTime + travelTime;

    // Calculate distance between current location and hospital
    const distance = getDistance(currentLat, currentLng, hospital.latitude, hospital.longitude);

    // Add hospital to additionalHospitals array if not the nearest one
    if (hospital !== nearestHospital) {
      additionalHospitals.push({
        name: hospital.name,
        waitTime: hospital.waitTime,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        distance // Add distance instead of total time
      });
    }

    if (totalTime < shortestTotalTime) {
      nearestHospital = hospital;
      shortestTotalTime = totalTime;
    }
  }

  // Sort additional hospitals by distance in ascending order
  additionalHospitals.sort((a, b) => a.distance - b.distance);

  // Add the next three shortest hospitals to the recommendation
  recommendation.add = additionalHospitals.slice(0, 3);

  recommendation.rec = {
    name: nearestHospital.name,
    waitTime: nearestHospital.waitTime,
    latitude: nearestHospital.latitude,
    longitude: nearestHospital.longitude,
    distance: getDistance(currentLat, currentLng, nearestHospital.latitude, nearestHospital.longitude)
  };

  return recommendation;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance.toFixed(2) + 'km';
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
