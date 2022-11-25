const normalWordBank =  require('./normalWordBank');
const hardWordBank =  require('./hardWordBank');
const dndWordBank =  require('./dndWordBank');

const normalLines = normalWordBank.split("\n");
const hardLines = hardWordBank.split("\n");
const dndLines = dndWordBank.split("\n");

const getWords = (redIsP1, gameType="normal") => {
  let p1Color = redIsP1? "red" : "blue";
  let p2Color = (!redIsP1)? "red" : "blue";
  return getFileWords(gameType, p1Color, p2Color);
}

const getFileWords = (gameType, p1, p2) => {
  let lines;
  
  if (gameType === "hard") {
    lines = hardLines
  } else if (gameType === "dnd") {
    lines = dndLines
  } else {
    lines = normalLines
  }
  
  let randomized = lines.sort(() => 0.5 - Math.random()).slice(0,25);
  let player1Count = 9;
  let player2Count = 8;
  let bombCount = 1;
  let tiles = [];

  while (randomized.length > 0) {
    let i = Math.floor(Math.random()*randomized.length);
    let word = randomized.pop()

    if (player1Count > 0) {
     player1Count-= 1;
     tiles.push({title: p1, tileHeader: word, clicked: false});
    } else if (player2Count > 0) {
      player2Count-= 1;
     tiles.push({title: p2, tileHeader: word, clicked: false});
    } else if (bombCount > 0) {
     bombCount-= 1;
     tiles.push({title: "bomb", tileHeader: word, clicked: false});
    } else {
     tiles.push({title: "blank", tileHeader: word, clicked: false});
    }
  }

  return tiles.sort(() => 0.5 - Math.random());
}

module.exports = getWords;
