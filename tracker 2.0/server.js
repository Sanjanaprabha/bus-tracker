const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const users = {};  // Store connected users

io.on('connection', function (socket) {
    socket.on("new-user", (username) => {
        users[socket.id] = username;
        console.log(`${username} connected`);
        // Broadcast the updated user list to all clients
        io.emit("user-list", users);
    });

    socket.on("send-location", function (data) {
        // Broadcast the location to all clients, including the sender's socket ID
        io.emit("receive-location", {
            id: socket.id, // Unique socket ID for each user
            username: users[socket.id], // Username of the sender
            ...data // Latitude and longitude
        });
    });

    socket.on("disconnect", function () {
        // Notify all clients that a user has disconnected
        io.emit("user-disconnected", socket.id);
        delete users[socket.id];
        // Broadcast the updated user list to all clients
        io.emit("user-list", users);
    });
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/map', (req, res) => {
    res.render('map');
});
app.get('/paper', (req, res) => {
    res.render('paper');
});

module.exports = app;

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

