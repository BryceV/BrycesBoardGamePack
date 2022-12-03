import React, {useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import './App.css';

function UserList(props) {
    let navigate = useNavigate();

    useEffect(() => {
        props.socket.on("starting game", facts => {
            props.setFacts(facts);
            navigate("/game");
        });

        // listeners must be removed to prevent multiple event registrations
        return () => {
            props.socket.off('starting game');
        };
      }, []);

    return (
        <div style={{color: 'white', fontSize: '20px'}}>
            <h3 style={{textDecoration: 'underline'}}>Users:</h3>
            {props.users &&
                <ul style={{paddingLeft: '0', margin: '0', listStylePosition: 'inside'}}>
                    {props.users.map(u => <li key={u + 'key'}>{u}</li>)}
                </ul>
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
                    padding: "10px",
                    marginTop: "60px"
                }} 
                type="submit"
                onClick={()=> {
                    props.socket.emit("start game", props.roomNumber);
                }}
            >
                Start Game
            </button>
        </div>
    );
}

export default UserList;