import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from "react-router-dom";
import _ from 'lodash';
import './App.css';

const Game = (props) => {
  const [selection, setSelection] = useState("");
  const [numPlayersSelected, setNumPlayersSelected] = useState(0);
  const [questionIndex, setquestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  let navigate = useNavigate();
  let exclamations = [
    'Gadzooks', 'Good gravy', 'Heavens', 'Never would have guessed', 'Jumping jehoshaphat', 
    'Well knock me down and call me silly', 'Lo and behold', 'Ill be a monkeys uncle', 'Great scott', 'I should have known',
    'Makes sense', 'In a twist of events', 'Everyone probably knew this but', 'Suprise', 'Well ok then...', 'I still dont believe it but',
    'You might need to talk to this person...', 'Not even I would have guessed', 'Alright, alright, alright,', 'for cryin out loud', 
    'This might need an explanation but', 'Oh my word', 'Yeah...', 'Given eternity I never would have gotten that', 'Wow'
  ];
  const firstUpdate = useRef(true);

  const makeSelection = (selectedUser) => {
    if (!showAnswer) {
      props.socket.emit("selection", props.roomNumber, props.user);
      setSelection(selectedUser);
    }
  }

  const getExclamation = () => {
    return _.sample(exclamations);
  }

  useEffect(() => {
    props.socket.on("sending next page", () => {
      setShowAnswer(showAnswer => !showAnswer);
    });

    props.socket.on("selection count updated", (count) => {
      setNumPlayersSelected(count);
    });

    props.socket.on("sending scores", () => {
      navigate("/scores");
    });

    // listeners must be removed to prevent multiple event registrations
    return () => {
      props.socket.off("sending next page");
      props.socket.off("selection count updated");
      props.socket.off("sending scores");
    };
  }, []);

  useEffect(() => {
    //Skip first render
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      if (!showAnswer) {
        if (props.facts.length === questionIndex + 1) {
          props.socket.emit("get score page", props.roomNumber);
        } else {
          //Update score. TODO: push this to server side
          if (selection === props.facts[questionIndex].owner) {
            props.socket.emit("add to score", props.roomNumber, props.user);
          }
          setSelection("");
          setquestionIndex(questionIndex => questionIndex+1)
        }
      }
    }
  }, [showAnswer]);

  return (
    <div style={{color: 'white', fontSize: '20px'}}>
      <div>
        {showAnswer && props.facts && (getExclamation() + " it was " + props.facts[questionIndex].owner)}
        {!showAnswer && props.facts && props.facts[questionIndex].fact}
      </div>
      {props.users &&
        props.users.map(u => 
          <div
            key={u + 'key'} 
            onClick={e => makeSelection(u)} 
            style={{
              width: '100%', 
              borderRadius: '25px', 
              backgroundColor: (showAnswer && u === props.facts[questionIndex].owner) ? "goldenrod" : (u === selection ? '#a6a6ff' : 'white'), 
              margin: '20px', 
              cursor: 'pointer',
              height: '60px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <span style={{color: 'black'}}>{u}</span>
          </div>
        )
      }

      <button
        style={{
          backgroundColor: ((props.users.length !== numPlayersSelected) && !showAnswer) ? "gray" : "blue",
          color: "white", 
          border: "none", 
          fontSize: "20px", 
          margin: "15px",
          cursor: "pointer",
          alignSelf: "center",
          padding: "10px"
        }}
        disabled={(props.users.length !== numPlayersSelected) && !showAnswer}
        type="submit"
        onClick={()=> {
          props.socket.emit("next page", props.roomNumber);
        }}
      >
        {showAnswer ? "Next fact" : "Show " + numPlayersSelected + " players the answer"}
      </button>
    </div>
  );
}

export default Game;