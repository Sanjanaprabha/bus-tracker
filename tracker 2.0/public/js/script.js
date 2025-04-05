const socket = io();
const username = prompt("Enter your name:");
if (!username) {
    alert("Username is required!");
    window.location.reload();
}
document.getElementById('username').textContent = username;

socket.emit("new-user", username);

// Initialize the map
const map = L.map("map").setView([0, 0], 16);

// Add a tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Real-time Tracking"
}).addTo(map);

// Custom bus icon for markers
const busIcon = L.icon({
    iconUrl: "/images/bus.svg",  // Ensure this file exists in public/images/
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