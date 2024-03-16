const express = require("express");
const axios = require("axios");
const cors = require("cors"); // Import the cors middleware
const app = express();
const port = 3000; // Choose an appropriate port number

// Use the cors middleware
app.use(cors());

let hospitalsData = {}; // Placeholder for hospitals data

const apiKey =
  "pk.eyJ1IjoiYWFuaWEiLCJhIjoiY2x0dGVhZnduMHFidjJrcDl1ZXltMXc1ciJ9.X2dUty73h2WbJSP16uZmEA"; // Replace with your actual Mapbox API key

app.use(express.json());

// POST endpoint to send hospitals data from frontend
app.post("/send-hospitals", (req, res) => {
  hospitalsData = req.body; // Assuming frontend sends hospitals data in the request body
  console.log("Received Data: ", hospitalsData);

  // Convert wait times from hours and minutes to minutes
  hospitalsData.facilities.forEach((hospital) => {
    hospital.waitTime = convertWaitTimeToMinutes(hospital.waitTime);
    console.log(hospital.waitTime);
  });
  console.log("Converted Data: ", hospitalsData);

  // // Attach coordinates to hospitalsData
  // const hospitalsDataWithCoordinates = attachCoordinates(hospitalsData);
  // console.log("Complete Data: ", hospitalsDataWithCoordinates);
  hospitalsData = attachCoordinates(hospitalsData);
  console.log("Complete Data: ", hospitalsData);

  res.status(200).send("Hospitals data received");
});

// GET endpoint to receive recommendation request from frontend
app.get("/recommendation", async (req, res) => {
  try {
    if (!hospitalsData.currentLocation || !hospitalsData.facilities) {
      return res.status(400).json({ error: "Hospitals data not provided" });
    }
    console.log("REACHED");

    const currentLocation = hospitalsData.currentLocation;
    const hospData = hospitalsData.facilities;

    const recommendation = await recommendNearestHospital(
      currentLocation[0],
      currentLocation[1],
      hospData
    );
    console.log(recommendation);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function getTravelTime(startLat, startLng, endLat, endLng) {
  const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?access_token=${apiKey}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data.routes[0].duration / 60; // Travel time in minutes
  } catch (error) {
    console.error("Error fetching travel time:", error.message);
    return Infinity; // Return a large value if there's an error
  }
}

async function recommendNearestHospital(currentLat, currentLng, hospData) {
  let nearestHospital = null;
  let shortestTotalTime = Infinity;
  const additionalHospitals = [];

  const recommendation = {
    rec: null,
    add: [],
  };

  for (const hospital of hospData) {
    const travelTime = await getTravelTime(
      currentLat,
      currentLng,
      hospital.latitude,
      hospital.longitude
    );
    const totalTime = hospital.waitTime + travelTime;

    // Calculate distance between current location and hospital
    const distance = getDistance(
      currentLat,
      currentLng,
      hospital.latitude,
      hospital.longitude
    );

    // Add hospital to additionalHospitals array if not the nearest one
    if (hospital !== nearestHospital) {
      additionalHospitals.push({
        name: hospital.name,
        waitTime: hospital.waitTime,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        distance, // Add distance instead of total time
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
    distance: getDistance(
      currentLat,
      currentLng,
      nearestHospital.latitude,
      nearestHospital.longitude
    ),
  };

  return recommendation;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance.toFixed(2) + "km";
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Function to convert wait time from hours and minutes to minutes
const convertWaitTimeToMinutes = (waitTime) => {
  const regex = /(\d+) hr (\d+) min/;
  const match = waitTime.match(regex);
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    return hours * 60 + minutes;
  } else {
    return null; // Return null if wait time format is incorrect
  }
};

// Function to attach latitude and longitude properties to facilities
// This is purposely for this demo
const attachCoordinates = (hospitalsData) => {
  const updatedFacilities = hospitalsData.facilities.map((facility) => {
    switch (facility.name) {
      case "Alberta Children's Hospital":
        return {
          ...facility,
          latitude: 51.038977,
          longitude: -114.12003,
        };
      case "Foothills Medical Centre":
        return {
          ...facility,
          latitude: 51.069336,
          longitude: -114.131056,
        };
      case "Peter Lougheed Centre":
        return {
          ...facility,
          latitude: 51.067292,
          longitude: -113.967246,
        };
      case "Rockyview General Hospital":
        return {
          ...facility,
          latitude: 50.977553,
          longitude: -114.067112,
        };
      case "South Health Campus":
        return {
          ...facility,
          latitude: 50.877606,
          longitude: -113.973131,
        };
      default:
        return facility;
    }
  });

  return {
    ...hospitalsData,
    facilities: updatedFacilities,
  };
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
