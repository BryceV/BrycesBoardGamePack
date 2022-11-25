import './App.css';
import React, {useState, useEffect} from 'react';
import CodeNamesLogo from "./assets/codenameslogo.png";

//TODO: Optimize for mobile
function App() {
  const [focusedElem, setFocusedElem] = useState("");
  const [joinCode, setJoinCode] = useState("");
  
  const getFocusedWidth = (elem) => {
    if (focusedElem === "") {
      return "50%";
    } else if (focusedElem === elem) {
      return "55%";
    }
    return "45%";
  }
  
  const joinRoom = () => {
    window.location.href = '/codenames/' + joinCode
  }
  
  return (
    <div style={{display: "flex", height: "100%"}}>
      <div 
        onMouseEnter={() => setFocusedElem("join")}
        style={{backgroundColor: "lightblue", flex: getFocusedWidth("join"), transition: "all .3s ease-in-out", display: "flex", justifyContent: "center", alignItems: "center"}}
      >
        <span style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h1>Join</h1>
          <label>Room Code</label>
          <input value={joinCode} onChange={e => setJoinCode(e.target.value)} type="text" />
          
          {/* <label>Username</label>
          <input type="text" /> */}
          
          <button 
            style={{backgroundColor: "blue", color: "white", border: "none", fontSize: "20px", margin: "15px", cursor: "pointer"}} type="submit"
            onClick={()=> joinRoom()}
          >
            Submit
          </button>
        </span>
      </div>
      
      <div
        onMouseEnter={() => setFocusedElem("create")}
        style={{backgroundColor: "#a4a4a4", flex: getFocusedWidth("create"), transition: "all .3s ease-in-out", display: "flex", justifyContent: "center", alignItems: "center"}}
      >
        <span style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
          <h1>Create</h1>
          <span style={{display: "flex"}}>
            <div 
              onClick={() => {
                let roomCode = Math.floor(Math.random() * 90000) + 10000;
                window.location.href = '/codenames/' + roomCode;
                console.log("Clicked on Code Names tile. Room: " + roomCode);
              }}
              style={{cursor: "pointer", flexDirection: "column", margin: "15px", backgroundColor: "white", width: "180px", height: "180px", boxShadow: "inset 0 0 10px #000000", display: "flex", justifyContent: "center", alignItems: "center"}}
            >              
              <h5 style={{margin: 0}}>Code Names</h5>
              <p style={{margin: 0}}>(4+ players)</p>
              {/* <img src={CodeNamesLogo} alt="Code names logo" style={{backgroundSize: "contain", width: "80px"}} /> */}
              <a href="https://en.wikipedia.org/wiki/Codenames_(board_game)" target="_blank">Game Instructions</a>
            </div>
          </span>
        </span>
      </div>
    </div>
  );
}

export default App;
