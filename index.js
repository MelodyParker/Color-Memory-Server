const express = require("express"); // use express
const app = express(); // create instance of express
const server = require("http").Server(app); // create server
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://color-memory.developerperson.repl.co",
      "https://f1729cba-2a25-4212-9a89-62badc863469.id.repl.co"
    ],
    methods: ["GET", "POST"]
  }
}); // create instance of socketio


const users = {};
const rooms = {};




io.on("connection", socket => {
  socket.emit("print", "connected")
  console.log("connected")
  socket.on("join", (username, room, callback) => {
    users[socket.id] = {};
    users[socket.id].room = room;
    users[socket.id].username = username;
    if (!(room in rooms)) {
      socket.join(room)
      rooms[room] = {startingPlayer: Math.floor(Math.random() * 2)};
      
      rooms[room].users = [{id: socket.id, username: username}];
      callback(true);
      console.log(`${username} has joined room "${room}".`);
      return
    }
    if (rooms[room].users.length >= 2) {
      callback(false, false, "", "Sorry, but that room is already full. Please try a different room.");
      return;
    }
    roomUsers = rooms[room].users.length;
    
    socket.join(room)
    socket.to(room).emit("join", socket.id, username)
    callback(true, rooms[room].startingPlayer === 1, rooms[room].users[0]);
    rooms[room].users.push({ id: socket.id, username: username});
    
    console.log(`${username} has joined room "${room}".`);
    return;
  })
  socket.on("start", () => {
    try {
      console.log(`Room ${users[socket.id].room} started`);
      rooms[users[socket.id].room].started = true;
      socket.emit("start")
      socket.to(users[socket.id].room).emit('start');
    }
    catch (err) {
      return socket.disconnect()
    }
  })
})

server.listen(3000, () => {
  console.log("Listening for traffic on port 3000.");
});