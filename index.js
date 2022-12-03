const express = require('express');
const path = require('path');
var http = require('http');
var _ = require('lodash');
var socketIO = require('socket.io');
const {getWords, codeNamesRoomData} = require ('./codenames-be/codeNameUtils');
const {didYouKnowRoomData} = require ('./did-you-know-be/didYouKnowUtils');

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

    //if the first user set up the boardgame data
    if (didYouKnowIO.adapter.rooms.get(roomNumber).size === 1) {
      didYouKnowRoomData[roomNumber] = {};
      didYouKnowRoomData[roomNumber].users = {};
      didYouKnowRoomData[roomNumber].facts = [];

      //resets with every page
      didYouKnowRoomData[roomNumber].selectedUsers = [];
    }
  });

  socket.on('restart game', (roomNumber, username, factOne, factTwo, factThree) => {
    didYouKnowRoomData[roomNumber] = {};
    didYouKnowRoomData[roomNumber].users = {};
    didYouKnowRoomData[roomNumber].facts = [];
    didYouKnowRoomData[roomNumber].selectedUsers = [];
    didYouKnowIO.to(roomNumber).emit("restarting game");
  });

  socket.on('add user', (roomNumber, username, factOne, factTwo, factThree) => {
    didYouKnowRoomData[roomNumber].users[username] = {score: 0};
    didYouKnowRoomData[roomNumber].facts.push({owner: username, fact: factOne});
    didYouKnowRoomData[roomNumber].facts.push({owner: username, fact: factTwo});
    didYouKnowRoomData[roomNumber].facts.push({owner: username, fact: factThree});
    didYouKnowIO.to(roomNumber).emit("updated user list", didYouKnowRoomData[roomNumber].users);
  });

  socket.on('start game', (roomNumber) => {
    didYouKnowRoomData[roomNumber].facts = _.shuffle(didYouKnowRoomData[roomNumber].facts);
    didYouKnowIO.to(roomNumber).emit("starting game", didYouKnowRoomData[roomNumber].facts);
  });

  socket.on('selection', (roomNumber, user) => {
    if (!didYouKnowRoomData[roomNumber].selectedUsers.includes(user)) {
      didYouKnowRoomData[roomNumber].selectedUsers.push(user);
      didYouKnowIO.to(roomNumber).emit("selection count updated", didYouKnowRoomData[roomNumber].selectedUsers.length);
    }
  });

  socket.on('next page', (roomNumber) => {
    didYouKnowRoomData[roomNumber].selectedUsers = [];
    didYouKnowIO.to(roomNumber).emit("selection count updated", didYouKnowRoomData[roomNumber].selectedUsers.length);
    didYouKnowIO.to(roomNumber).emit("sending next page");
  });

  socket.on('add to score', (roomNumber, user) => {
    didYouKnowRoomData[roomNumber].users[user].score++;
    didYouKnowIO.to(roomNumber).emit("updated user list", didYouKnowRoomData[roomNumber].users);
  });

  socket.on('get score page', (roomNumber) => {
    didYouKnowIO.to(roomNumber).emit("sending scores");
  });


  socket.on('disconnect', () => {
    console.log("Client "+socket.id+" disconnected from did-you-know");
  });
})

server.listen(port, function(){
  console.log('listening on ' + port);
});
