import React, {useState, useEffect} from 'react';
import io from 'socket.io-client'
import Switch from "react-switch";
import { chunk } from 'lodash-es';

import './App.css';
import badSound from './assets/badSound.mp3';
import goodSound from './assets/goodSound.mp3';
import explosion from './assets/explosion.mp3';
import whoosh from './assets/whoosh.mp3';

//const socket = socketIOClient("localhost:5000");
const socket = io("/codenames");

const App = () => {
  const [redsTurn, setRedsTurn] = useState(true);
  const [words, setWords] = useState([]);
  const [spymaster, setSpymaster] = useState(false);
  // const [redcount, setRedcount] = useState(9);
  // const [bluecount, setBluecount] = useState(8);
  const [rows, setRows] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    socket.on("outgoing data", data => {
      setWords(data);
    });
    socket.on("outgoing new data", data => {
      setSpymaster(false);
      setWords(data);
      (new Audio(whoosh)).play(); 
    });
    socket.on("outgoing turn change", turn => {
      setRedsTurn(turn)
    });
    socket.on("play click sound", (color) => {
      if(color==="good") {
        (new Audio(goodSound)).play();
      } else if (color==="explosion") {
        (new Audio(explosion)).play();
      } else {
        (new Audio(badSound)).play();
      }
    });

    let pathParts = window.location.pathname.split('/').filter(x => x);
    if (pathParts.length >= 1) {
      setRoomNumber(pathParts[pathParts.length - 1]);
      socket.emit('join', pathParts[pathParts.length - 1]);
    } else {
      console.log('ERR: Could not set room number');
    }
  }, []);
 
  const nextRound = (gameType) => {
    socket.emit("new round", roomNumber, gameType);  
  }
  
  const changeTurn = () => socket.emit("change turn", roomNumber); 
  
  useEffect(() => {  
    const handleClick = (tileNum) => {
      //console.log(tileNum);
        
        if (!spymaster && !words[tileNum].clicked) {
          //Make tile changed to clicked state
          let newWords = JSON.parse(JSON.stringify(words));
          newWords[tileNum].clicked = true;
          socket.emit("update data", roomNumber, newWords);
          
          //If its a not the teams color, switch to other teams turn
          if ((redsTurn && words[tileNum].title !== "red") ||
              (!redsTurn && words[tileNum].title !== "blue")) {
            changeTurn();
            if (words[tileNum].title === "bomb") {
              socket.emit("play sound", roomNumber, "explosion");
            } else {
              socket.emit("play sound", roomNumber, "bad");
            }
          } else {
            socket.emit("play sound", roomNumber, "good");
          }
        }
    }
    
    function refreshRows() {
      let newrows=[];
      let makeSqr = (w,i) => <Square word={w} spymaster={spymaster} key={i} handleClick={() => handleClick(i)}/>;

      chunk(words, 5).forEach((fiveWordChunk, rowIndex) => {
        newrows.push(
          <div key={"row" + rowIndex} style={{display: 'flex', flex: 1}}>
            { fiveWordChunk.map((w, i) => makeSqr(w,i + (rowIndex*5))) }
          </div>);
      });
      
      setRows(newrows);
    }
  
    refreshRows();
  }, [words, spymaster, redsTurn]);
  
  const getCountFor = (color) => {
    //Tile matches color and is not clicked yet, counts as one
    return words.reduce((acc, w) => (w.title===color && !w.clicked)? acc+1 : acc, 0);    
  }
  
  return (
    <div className="App" style={{display: 'flex', flexDirection: 'column', background: '#434343', paddingLeft: '10%', paddingRight: '10%'}}>
      <h1 style={{color: 'white', margin: 0, marginBottom: '25px'}} className="title">Code Names</h1>

      <div style={{display: 'flex', justifyContent: 'space-between', marginLeft: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
          <h2 style={{color: 'red', margin: 0}}>{getCountFor("red")}</h2> 
          <h2 style={{color: 'white', margin: 0}}>-</h2> 
          <h2 style={{color: 'blue', margin: 0}}>{getCountFor("blue")}</h2> 
         </div>
        
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
          {
  	         redsTurn? 	
            (<h4 style={{color: 'red',  margin: 0, marginRight: '20px'}}>red's turn</h4>) :
            (<h4 style={{color: 'blue', margin: 0, marginRight: '20px'}}>blue's turn</h4>)
          }

          <button style={{marginRight: '20px'}} onClick={() => changeTurn()}> Next turn </button>
        </div>
      </div>
      
      <div style={{display: 'flex', flexDirection: 'column', margin: '10px', flex: 1}}>
      { rows }
      </div>
     
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <p style={{color: 'white', margin: '5px'}}> Game Types (resets game): </p>
          <button style={{marginLeft: '20px', marginRight: '20px'}} onClick={() => nextRound("normal")}> Normal </button>
          <button style={{marginLeft: '20px', marginRight: '20px'}} onClick={() => nextRound("hard")}> Hard </button>
          <button style={{marginLeft: '20px', marginRight: '20px'}} onClick={() => nextRound("dnd")}> D&D </button>
        </div>
      
        <div>
          <p style={{color: 'white', margin: '5px'}}> Spymaster View: </p>
          <Switch offColor="#5d0101" onColor="#005300" onChange={() => setSpymaster(!spymaster)} checked={spymaster} />
        </div>
      </div>
      
       <h4 style={{color: 'white', margin: 0, marginBottom: '10px'}}><a style={{color: 'white'}} href='https://en.wikipedia.org/wiki/Codenames_(board_game)'>About the game</a></h4>
     </div>
  );
}

const Square = ({word, spymaster, handleClick}) => {
  let textColor = 'black';
  let bgColor = (word.clicked)? '#7E7E7E' : '#c1c1c1';
  
  if (spymaster || word.clicked) {
    switch (word.title) {
      case "red":
        textColor = "red";
        break;
      case "blue":
        textColor = "blue";
        break;
      case "bomb":
        textColor = "#d79f00";
        break;
      default:
        textColor= "black";
    }
  }
  
  return (
    <div onClick={handleClick} style={{minWidth: 0, background: bgColor, margin: '5px', color: textColor, flexBasis: '20%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <p style={{fontSize: '20px', fontWeight: 'bold', wordBreak: 'break-word'}}>{word.tileHeader.toUpperCase()}</p>
    </div>
  );
}

export default App;
