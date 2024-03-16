import React, { useState } from "react";
import Map from "./Map.jsx";

const Recommend = ({ currentLocation, hospitalInfo }) => {
  // State to set selected hospital
  const [selectedHospital, setSelectedHospital] = useState("");

  // State variable to signal when to change to Map
  const [hospitalProcessed, setHospitalProcessed] = useState(false);

  if (!hospitalInfo) return null; // Return null if hospitalInfo is not available yet

  const handleClick = () => {
    // When hospital info is clicked, display a map that directs them to the hospital

    console.log("Hospital name clicked!");

    // Move on to Map
    setHospitalProcessed(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-700 overflow-hidden p-10">
      {hospitalProcessed ? (
        <Map
          currentLocation={currentLocation}
          hospitalInfo={selectedHospital}
        />
      ) : (
        <>
          <div className="bg-white p-8 rounded-lg shadow-md w-80">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">Recommended Hospital:</h3>
              <div
                className="flex flex-col border border-gray-200 p-4 rounded-lg mb-4 bg-green-300"
                onClick={() => handleClick(hospitalInfo.recommendedLocation)}
              >
                <p className="font-bold">
                  {hospitalInfo.recommendedLocation.name}
                </p>
                <p>Wait Time: {hospitalInfo.recommendedLocation.waitTime}</p>
                <p>Distance: {hospitalInfo.recommendedLocation.distance}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 my-8 rounded-lg shadow-md w-80">
            <div>
              <h3 className="text-lg font-bold mb-2">Nearby Hospitals:</h3>
              {hospitalInfo.nearestLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex flex-col border border-gray-200 p-4 rounded-lg mb-4 bg-gray-200"
                  onClick={() => handleClick(location)}
                >
                  <p className="font-bold">{location.name}</p>
                  <p>Wait Time: {location.waitTime}</p>
                  <p>Distance: {location.distance}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Recommend;
