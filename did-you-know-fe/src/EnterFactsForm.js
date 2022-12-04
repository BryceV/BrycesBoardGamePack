import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client'
import './App.css';

const socket = io("/didyouknow");

const EnterFactsForm = (props) => {
  const [username, setUsername] = useState("");
  const [factOne, setFactOne] = useState("");
  const [factTwo, setFactTwo] = useState("");
  const [factThree, setFactThree] = useState("");
  let navigate = useNavigate();

  return (
    <div>
      <div style={{display: 'flex', margin: '20px', color: 'white', fontSize: '20px', alignItems: 'center'}}>
        <label style={{paddingRight: '20px'}}>Username:  </label>
        <input style={{width: '100%'}} value={username} onChange={e => setUsername(e.target.value)} type="text" />
      </div>

      <div style={{display: 'flex', margin: '20px', color: 'white', fontSize: '20px', height: '20%', alignItems: 'center'}}>
        <label>Fact #1:</label>
        <textarea style={{resize: 'none', width: '100%', height: '100%'}} value={factOne} onChange={e => setFactOne(e.target.value)} />
      </div>

      <div style={{display: 'flex', margin: '20px', color: 'white', fontSize: '20px', height: '20%', alignItems: 'center'}}>
        <label>Fact #2:</label>
        <textarea style={{resize: 'none', width: '100%', height: '100%'}} value={factTwo} onChange={e => setFactTwo(e.target.value)} />
      </div>

      <div style={{display: 'flex', margin: '20px', color: 'white', fontSize: '20px', height: '20%', alignItems: 'center'}}>
        <label>Fact #3:</label>
        <textarea style={{resize: 'none', width: '100%', height: '100%'}} value={factThree} onChange={e => setFactThree(e.target.value)} />
      </div>

      <button
        disabled={!username || !factOne || !factTwo || !factThree}
        style={{
          backgroundColor: (!username || !factOne || !factTwo || !factThree) ? "gray" : "blue", 
          color: "white", 
          border: "none", 
          fontSize: "20px", 
          margin: "15px",
          cursor: "pointer",
          alignSelf: "center",
          padding: "10px"
        }} 
        type="submit"
        onClick={()=> {
          socket.emit("add user", props.roomNumber, username, factOne, factTwo, factThree);
          props.setUser(username);
          navigate("/users");
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default EnterFactsForm;
