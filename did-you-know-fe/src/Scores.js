import React, {useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import './App.css';

const Scores = (props) => {
  let navigate = useNavigate();
  
  useEffect(() => {
    props.socket.on("restarting game", () => {
      navigate("/");
    });

    // listeners must be removed to prevent multiple event registrations
    return () => {
      props.socket.off('restarting game');
    };
  }, []);

  return (
    <div style={{color: 'white', fontSize: '20px'}}>
      <h3 style={{textDecoration: 'underline'}}>Final Scores:</h3>

      {props.users &&
        Object.keys(props.users).sort((u1,u2) => props.users[u1].score - props.users[u2].score).map(u => 
          <div
            key={u + 'key'}
            style={{
              height: '60px',
            }}>
            <span>{u} : {props.users[u].score}</span>
          </div>
        )
      }

      <button
        style={{
          backgroundColor: "blue",
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
          props.socket.emit("restart game", props.roomNumber);
        }}
      >
        Restart game
      </button>
    </div>
  );
}

export default Scores;