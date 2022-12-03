import React, {useState, useEffect} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import io from 'socket.io-client'
import EnterFactsForm from './EnterFactsForm'
import UserList from './UserList'
import Game from './Game'
import Scores from './Scores'
import './App.css';

const socket = io("/didyouknow");

const App = () => {
  const [roomNumber, setRoomNumber] = useState("");
  const [user, setUser] = useState("");
  const [users, setUsers] = useState({});
  const [facts, setFacts] = useState([]);

  useEffect(() => {
    socket.on("updated user list", users => {
      setUsers(users);
    });

    let pathParts = window.location.pathname.split('/').filter(x => x);
    if (pathParts.length >= 1) {
      setRoomNumber(pathParts[pathParts.length - 1]);
      socket.emit('join', pathParts[pathParts.length - 1]);
    } else {
      console.log('ERR: Could not set room number');
    }

    // listeners must be removed to prevent multiple event registrations
    return () => {
      socket.off('updated user list');
    };
  }, []);

  return (
    <Router basename={"/didyouknow/" + roomNumber}>
      <div style={{color: 'white', margin: 0, marginBottom: '25px', float: 'left', position: 'absolute', fontSize: '20px'}}>Room code: {roomNumber}</div>

      <div className="App" style={{display: 'flex', flexDirection: 'column', background: '#434343', paddingLeft: '10%', paddingRight: '10%'}}>
        <h1 style={{color: 'white', margin: 0, marginBottom: '25px'}} className="title">Did You Know</h1>
        <Routes>
          <Route path='/' element={<EnterFactsForm roomNumber={roomNumber} setUser={setUser}/>} />
          <Route path='/users' element={<UserList roomNumber={roomNumber} socket={socket} users={Object.keys(users)} setFacts={setFacts}/>} />
          <Route path='/game' element={<Game roomNumber={roomNumber} socket={socket} users={Object.keys(users)} user={user} facts={facts}/>} />
          <Route path='/scores' element={<Scores roomNumber={roomNumber} socket={socket} users={users}/>} />
        </Routes>
      </div>
     </Router>
  );
}

export default App;
