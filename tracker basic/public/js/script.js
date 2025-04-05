const socket = io();

// Ask for username when user joins
const username = prompt("Enter your name:");
if (!username) {
    alert("Username is required!");
    window.location.reload();
}

socket.emit("new-user", username);

// Check for geolocation support and watch position
if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude, username });
    }, 
    (error) => {
        console.log(error);
    },
    {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Real-time Tracking"
}).addTo(map);

// Custom bus icon for markers
const busIcon = L.icon({
    iconUrl: "/images/bus.svg",  // Ensure this file exists in `public/images/`
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Store markers by user ID
const markers = {};

// Listen for incoming location data from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude, username } = data;
    map.setView([latitude, longitude]);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        markers[id].bindPopup(`${username}`).openPopup();
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: busIcon })
            .addTo(map)
            .bindPopup(`${username}`)
            .openPopup();
    }
});

// Remove markers when a user disconnects
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
