const express = require('express');
const app = express();
const port = 3000;

// Example hospitals data
const hospitals = require('./hospitals.json');

// Function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

// Recommendation engine endpoint
app.get('/recommend-hospital', (req, res) => {
  const userLat = parseFloat(req.query.lat);
  const userLong = parseFloat(req.query.long);

  if (!userLat || !userLong) {
    return res.status(400).send('Latitude and longitude parameters are required.');
  }

  let recommendedHospital = null;
  let minScore = Infinity; // Lower score is better

  hospitals.forEach(hospital => {
    const distance = calculateDistance(userLat, userLong, hospital.latitude, hospital.longitude);
    // Simple scoring: prioritize wait time over distance
    const score = hospital.waitTime + distance;
    if (score < minScore) {
      minScore = score;
      recommendedHospital = {
        ...hospital,
        distance: distance.toFixed(2) + ' km'
      };
    }
  });

  res.json(recommendedHospital);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
