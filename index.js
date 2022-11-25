const express = require('express');
const path = require('path');
var http = require('http');
var socketIO = require('socket.io');
const {getWords, codeNamesRoomData} = require ('./codenames-be/codeNameUtils');

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIO(server);
const codeNamesIO = io.of('/codenames');
const didYouKnowIO = io.of('/didyouknow');

// Serve the static files from the React app
app.use('/codenames/:roomNumber', express.static(path.resolve(__dirname, 'codenames-fe/build')));
app.use('/didyouknow/:roomNumber', express.static(path.resolve(__dirname, 'did-you-know-fe/build')));
app.use("/", express.static(path.resolve(__dirname, 'home-page/build')));

// Serve the static files from the React app
app.get("/api/roomType/:joinCode", (req, res) => {
  //todo: clear codeNamesRoomData when last person leaves
  let roomType = Object.keys(codeNamesRoomData).includes(req.params.joinCode) ? 'codenames' : 'didyouknow';
  res.end(JSON.stringify({ roomType }));
});

codeNamesIO.on('connection', socket => {
  console.log(`New client ${socket.id} connected to code-names`);

  socket.on('join', (roomNumber) => {
    console.log(`Client ${socket.id} is joining code-names room ${roomNumber}`);
    socket.join(roomNumber);

    //if the first user set up the boardgame data
    if (codeNamesIO.adapter.rooms.get(roomNumber).size === 1) {
      codeNamesRoomData[roomNumber] = {};
      codeNamesRoomData[roomNumber].redIsP1 = true;
      codeNamesRoomData[roomNumber].redsTurn = true;
      codeNamesRoomData[roomNumber].data = getWords(codeNamesRoomData[roomNumber].redIsP1);
    }

    //Give them the current data
    socket.emit("outgoing data", codeNamesRoomData[roomNumber].data);
    socket.emit("outgoing turn change", codeNamesRoomData[roomNumber].redsTurn);
  });
  
  socket.on('new round', (roomNumber, gameType) => {
    codeNamesRoomData[roomNumber].redsTurn = codeNamesRoomData[roomNumber].redIsP1;
    codeNamesRoomData[roomNumber].redIsP1 = !codeNamesRoomData[roomNumber].redIsP1; //Toggle starting color
    codeNamesRoomData[roomNumber].data = getWords(codeNamesRoomData[roomNumber].redIsP1, gameType);
    codeNamesIO.to(roomNumber).emit("outgoing turn change", codeNamesRoomData[roomNumber].redsTurn);
    codeNamesIO.to(roomNumber).emit("outgoing new data", codeNamesRoomData[roomNumber].data);
  });
  
  socket.on('update data', (roomNumber, newData) => {
    codeNamesRoomData[roomNumber].data = newData;
    codeNamesIO.to(roomNumber).emit("outgoing data", codeNamesRoomData[roomNumber].data);
  });
  
  socket.on('change turn', (roomNumber) => {
    codeNamesRoomData[roomNumber].redsTurn = !codeNamesRoomData[roomNumber].redsTurn;
    codeNamesIO.emit("outgoing turn change", codeNamesRoomData[roomNumber].redsTurn);
  });

  socket.on('disconnect', () => {
    console.log("Client "+socket.id+" disconnected from code-names");
  });
  
  socket.on('play sound', (roomNumber, value) => {
    codeNamesIO.to(roomNumber).emit("play click sound", value);
  });
})

didYouKnowIO.on('connection', socket => {
  console.log(`New client ${socket.id} connected to did-you-know`);

  socket.on('join', (roomNumber) => {
    console.log(`Client ${socket.id} is joining did-you-know room ${roomNumber}`);
    socket.join(roomNumber);
  });


  socket.on('disconnect', () => {
    console.log("Client "+socket.id+" disconnected from did-you-know");
  });
})

server.listen(port, function(){
  console.log('listening on ' + port);
});
