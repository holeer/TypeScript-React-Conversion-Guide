import React from "react";
import { useState, useRef, useEffect } from "react";
import { CellValue, GameState, playerCell, aiCell } from "./constants"; 

interface BoardState {
    cells: CellValue[];
    gameState: GameState;
}

export const Board: React.FC = () => {

    const getInitState = (): BoardState => { 
        let cells = Array.apply(null, Array(9)).map(() => "");
        return {cells: cells, gameState: ""}
    }    

    const [state, setState] = useState<BoardState>(() => getInitState());
    const oldState = useRef(state.gameState);

    const resetState = (): void => {
        setState(getInitState());
    }
    
    useEffect(() => {
        window.addEventListener("restart", () => resetState());
        return () => {
            window.removeEventListener("restart", () => resetState());
        };
    },[]);
    
    // Fire a global event notifying GameState changes
    const handleGameStateChange = (newState: GameState) => {
        var event = new CustomEvent("gameStateChange", { "detail": state.gameState });
        event.initEvent("gameStateChange", false, true); 
        window.dispatchEvent(event);
    }   
    
    // check the game state - use the latest move
    const checkGameState = (cells: CellValue[], latestPos: number, latestVal: CellValue): GameState => {
        if (state.gameState !== "") {
            return state.gameState;
        }
        
        // check row
        let result = check3Cells(cells, 3 * Math.floor(latestPos / 3), 
            3 * Math.floor(latestPos / 3) + 1, 3 * Math.floor(latestPos/3) + 2);
        if (result) {
            return result; 
        }
        
        // check col
        result = check3Cells(cells, latestPos % 3, latestPos % 3 + 3, latestPos % 3 + 6);
        if (result) {
            return result;
        }
        
        // check diag
        result = check3Cells(cells, 0, 4, 8);
        if (result) {
            return result;
        }
        result = check3Cells(cells, 2, 4, 6);
        if (result) {
            return result;
        }
        
        // check draw - if all cells are filled
        if (findAllEmptyCells(cells).length === 0) {
            return "Draw";          
        }
                
        return "";
    }
    
    // check if 3 cells have same non-empty val - return the winner state; otherwise undefined 
    const check3Cells = (cells: CellValue[], pos0: number, pos1: number, pos2: number): GameState | undefined => {
        if (cells[pos0] === cells[pos1] &&
            cells[pos1] === cells[pos2] &&
            cells[pos0] !== "") {
            if (cells[pos0] === "X") {
                return "X Wins!";
            }
            return "O Wins!";
        }
        else {
            return undefined;
        }
    }
    
    // list all empty cell positions
    const findAllEmptyCells = (cells : CellValue[]): number[] => {
        return cells.map((v, i) => { 
            if (v === "") {
                return i;
            }
            else { 
                return -1;
            }
        }).filter(v => { return v !== -1 });        
    }
    
    // make a move
    const move = (pos: number, val: CellValue): void => {
        if (state.gameState === "" &&
            state.cells[pos] === "") {
            let newCells = state.cells.slice();
            newCells[pos] = val;
            const newState = { cells: newCells, gameState: checkGameState(newCells, pos, val) };
            setState(newState);
        }
    }

    // handle a new move from player
    const handleNewPlayerMove = (pos: number): void => {
        move(pos, playerCell);
    }

    const cells = state.cells.map((v, i) => {
        return (
            <Cell key={i} pos={i} val={v} handleMove={() => handleNewPlayerMove(i)} />
        )           
    } );

    useEffect(
        () => {
            if (state.gameState !== oldState.current) {
                handleGameStateChange(state.gameState);
            }
            oldState.current = state.gameState;
            const playerMoves = state.cells.filter(v => v === 'X').length;
            const aiMoves = state.cells.filter(v => v === 'O').length;
            if (aiMoves < playerMoves) {
                // AI make a random move following player's move
                let emptyCells = findAllEmptyCells(state.cells);
                let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                move(pos, aiCell);
            }
        }, [state]
    )
   
    return ( 
        <div className="board"> 
            {cells}
        </div> 
    )
}

interface CellProps {
    pos: number;
    val: CellValue;   
    handleMove: () => void;
}

const Cell = ({pos, val, handleMove}: CellProps) => {

    // position of cell to className
    const posToClassName = (pos: number): string => {
        let className = "cell";
        switch (Math.floor(pos / 3)) {
            case 0: 
                className += " top";
                break;
            case 2: 
                className += " bottom";
                break;
            default: break;             
        }
        switch (pos % 3) {    
            case 0: 
                className += " left";
                break;
            case 2: 
                className += " right";
                break;
            default: 
                break;             
        }
        return className;
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        handleMove();
    }

    return <div className={posToClassName(pos)} onClick={e => handleClick(e)}> 
            <div className={val === "" ? "" : val}> {val} </div>
        </div>

}
