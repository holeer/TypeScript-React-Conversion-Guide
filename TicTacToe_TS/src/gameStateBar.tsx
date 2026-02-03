import React from "react";
import { useState, useEffect } from "react";
import { GameState } from "./constants";

interface GameStateBarState {
    gameState: GameState;    
}

export const GameStateBar: React.FC = () => {

    const [state, setState] = useState<GameStateBarState>({gameState: ""});
    
    const handleGameStateChange = (e: CustomEvent) => {
        setState({gameState: e.detail});
    }
  
    const handleRestart = (e: Event) => {
        setState({gameState: ""});
    }

    useEffect(
        () => {
            window.addEventListener("gameStateChange", (e: CustomEvent) => handleGameStateChange(e));
            window.addEventListener("restart", (e: CustomEvent) => handleRestart(e));
            return () => {         
                window.removeEventListener("gameStateChange", (e: CustomEvent) => handleGameStateChange(e));
                window.removeEventListener("restart", (e: CustomEvent) => handleRestart(e));
            }  
        },[]
    )
    
    return (
        <div className="gameStateBar"> {state.gameState} </div> 
    )
}   
