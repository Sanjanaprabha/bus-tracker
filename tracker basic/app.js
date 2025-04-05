const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

const users = {};  // Store connected users

io.on('connection', function (socket) {
    socket.on("new-user", (username) => {
        users[socket.id] = username;
        console.log(`${username} connected`);
    });

    socket.on("send-location", function (data) {
        io.emit("receive-location", {
            id: socket.id,
            username: users[socket.id],  // Send username with location
            ...data
        });
    });

    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id);
        delete users[socket.id];
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
