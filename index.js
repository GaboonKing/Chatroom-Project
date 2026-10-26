const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function getRandomNumber(min, max){
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);

    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

const usernames = new Set();
io.on('connection', (socket) => {
    //console.log('a user connected');
    socket.on('set username', (username) =>{
        username = username.trim();
        if(usernames.has(username))
        {
            socket.emit("username taken");
            return
        }
        socket.username = username;
        usernames.add(username);
        io.emit('username accepted');
        io.emit('new connection', socket.username);

    })
    socket.on('chat message', (msg) => {
        io.emit('chat message', {
            username: socket.username,
            message: msg
        }) // broadcast the event to all connected users
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
        usernames.delete(socket.username);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
})