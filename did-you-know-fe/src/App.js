import React, {useState, useEffect} from 'react';
import io from 'socket.io-client'
import './App.css';

const socket = io("/didyouknow");

const App = () => {
  const [roomNumber, setRoomNumber] = useState("");
  
  useEffect(() => {
    let pathParts = window.location.pathname.split('/').filter(x => x);
    if (pathParts.length >= 1) {
      setRoomNumber(pathParts[pathParts.length - 1]);
      socket.emit('join', pathParts[pathParts.length - 1]);
    } else {
      console.log('ERR: Could not set room number');
    }
  }, []);

  return (
    <div className="App" style={{display: 'flex', flexDirection: 'column', background: '#434343', paddingLeft: '10%', paddingRight: '10%'}}>
      <h1 style={{color: 'white', margin: 0, marginBottom: '25px'}} className="title">Did You Know</h1>
     </div>
  );
}

export default App;
