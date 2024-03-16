import React, { useState } from "react";
import Recommend from "./Recommend.jsx";

const Location = () => {
  const nearbyLocations = [
    "Wilder Institute/Calgary Zoo",
    "Nose Hill Park",
    "Tomkins Park",
  ];

  // const nearbyLocations = [
  //   {
  //     name: "Wilder Institute/Calgary Zoo",
  //     lat: 51.045988059025596,
  //     lon: -114.02363088898703,
  //   },
  //   {
  //     name: "Nose Hill Park",
  //     lat: 51.111595326834504,
  //     lon: -114.11124496014608,
  //   },
  //   { name: "Tomkins Park", lat: 51.038110044692324, lon: -114.08053998898775 },
  // ];

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLocationLat, setSelectedLocationLat] =
    useState(51.045988059025596);
  const [selectedLocationLon, setSelectedLocationLon] =
    useState(-114.02363088898703);

  const [hospitalInfo, setHospitalInfo] = useState(null);

  // State variable to signal when to change to Recommend
  const [locationProcessed, setLocationProcessed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationChange = async (event) => {
    setSelectedLocation(event.target.value);
  };

  const fetchHospitalInfo = async () => {
    try {
      // Simulate loading delay
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch data from the API
      const response = await fetch(
        "https://www.albertahealthservices.ca/Webapps/WaitTimes/api/waittimes/"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data from the server.");
      }

      // Parse the JSON response
      const data = await response.json();

      // Extract data for Calgary (you can extend this for other cities)
      const calgaryData = data.Calgary;
      const emergencyFacilities = calgaryData.Emergency;

      // Extract relevant information from emergency facilities
      const facilities = emergencyFacilities.map((facility) => ({
        name: facility.Name,
        waitTime: facility.WaitTime,
        url: facility.URL,
      }));
      console.log(facilities);

      // TODO: send current location and locations to backend and get back a json of recommended location and nearest locations
      const sendToBackend = {
        currentLocation: [selectedLocationLat, selectedLocationLon],
        facilities: facilities,
      };

      // TODO: backend endpoint
      const receivedFromBackend = await fetch(
        "http://localhost:3000/send-hospitals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendToBackend),
        }
      );

      if (!receivedFromBackend.ok) {
        throw new Error("Failed to send data to the server.");
      }

      // Call another endpoint to fetch the processed data
      const processedDataResponse = await fetch(
        "http://localhost:3000/recommendation"
      );

      if (!processedDataResponse.ok) {
        throw new Error("Failed to receive processed data from the server.");
      }

      // Get the processed data from the backend
      const processedData = await processedDataResponse.json();
      console.log("Processed data from backend:", processedData);

      // // DUMMY DATA
      // const processedData = {
      //   recommendedLocation: {
      //     name: "St. Mercy Downtown Hospital",
      //     waitTime: "15 minutes",
      //     url: "http://www.stmercyhospital.com",
      //     distance: "2.5 km",
      //   },
      //   nearestFacilities: [
      //     {
      //       name: "City Health Urgent Care",
      //       waitTime: "25 minutes",
      //       url: "http://www.cityhealthuc.com",
      //       distance: "3.2 km",
      //     },
      //     {
      //       name: "General Hospital East Wing",
      //       waitTime: "30 minutes",
      //       url: "http://www.generaleastwinghospital.com",
      //       distance: "4.1 km",
      //     },
      //     {
      //       name: "St. Mercy Downtown Hospital",
      //       waitTime: "15 minutes",
      //       url: "http://www.stmercyhospital.com",
      //       distance: "2.5 km",
      //     },
      //   ],
      // };

      // Set the hospital info state from backend response
      setHospitalInfo(processedData);

      // Move on to Recommend
      setLocationProcessed(true);
    } catch (error) {
      setError("Failed to fetch hospital information. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await fetchHospitalInfo();
      console.log("Selected Location:", selectedLocation);
    } catch (error) {
      console.error("Error submitting location:", error);
      setError("Failed to process location. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-700 overflow-hidden">
      {locationProcessed ? (
        <Recommend
          currentLocation={selectedLocation}
          hospitalInfo={hospitalInfo}
        />
      ) : (
        <form
          onSubmit={handleLocationSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-60"
        >
          <h2 className="text-2xl font-bold mb-4 justify-center text-center ">
            MediDirect
          </h2>
          <select
            value={selectedLocation}
            onChange={handleLocationChange}
            className="input input-bordered w-full mb-4"
          >
            <option value="">Select your location...</option>
            {nearbyLocations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-primary w-full bg-slate-100 rounded-full"
            disabled={!selectedLocation || loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default Location;
