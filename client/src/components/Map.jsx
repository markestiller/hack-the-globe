// import React, { useEffect, useRef } from "react";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css";

// const Map = ({ currentLocation, hospitalInfo }) => {
//   // Reference to the div element to render the map
//   const mapContainerRef = useRef(null);

//   // Initialize map when the component mounts
//   useEffect(() => {
//     // Check if Mapbox access token is set
//     mapboxgl.accessToken =
//       "pk.eyJ1IjoibWFya2VzdGlsbGVyIiwiYSI6ImNsdHRiZ2xlejExOHIya29ldTVzbGIzM2oifQ.4sDpCKJ6oFYJtOIfYfc_8Q";
//     if (!mapboxgl.accessToken) {
//       console.error("Mapbox access token is not set.");
//       return;
//     }

//     // Initialize Mapbox map
//     const map = new mapboxgl.Map({
//       container: mapContainerRef.current,
//       style: "mapbox://styles/mapbox/streets-v11", // Modify map style here
//       // TODO: SET LONG LAT OF CURRENT LOCATION
//       //   center: [currentLocation.longitude, currentLocation.latitude], // Set the initial center of the map
//       center: [43.65815, -79.38637],
//       zoom: 1, // Set the initial zoom level
//     });

//     // Add marker for the hospital location
//     new mapboxgl.Marker()
//       // TODO: SET LONG LAT OF CHOSEN HOSPITAL
//       //   .setLngLat([hospitalInfo.longitude, hospitalInfo.latitude])
//       .setLngLat([43.65815, -79.38637])
//       .addTo(map);

//     // Cleanup function to remove the map on component unmount
//     return () => map.remove();
//   }, [currentLocation, hospitalInfo]);

//   return <div ref={mapContainerRef} className="w-full h-96" />;
// };

// export default Map;
