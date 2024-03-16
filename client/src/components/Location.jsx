import React, { useState } from "react";
import Recommend from "./Recommend.jsx";

const Location = () => {
  const nearbyLocations = ["21 Adelaide St", "99 King St", "44 Church St"];

  const [selectedLocation, setSelectedLocation] = useState("");
  const [hospitalInfo, setHospitalInfo] = useState(null);

  // State variable to signal when to change to Recommend
  const [locationProcessed, setLocationProcessed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationChange = (event) => {
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
        currentLocation: selectedLocation,
        facilities: facilities,
      };

      // TODO: backend endpoint
      const receivedFromBackend = await fetch("/send-facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendToBackend),
      });

      if (!receivedFromBackend.ok) {
        throw new Error("Failed to send data to the server.");
      }

      // Set the hospital info state from backend response
      setHospitalInfo(receivedFromBackend);

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
            MediMap🏥
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
