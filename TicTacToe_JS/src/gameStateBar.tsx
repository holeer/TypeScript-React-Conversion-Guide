import * as React from "react";

interface GameStateBarState {
    gameState: "" | "X Wins!" | "O Wins!" | "Draw";
}

export class GameStateBar extends React.Component<any, GameStateBarState> {
    
    // React类组件的构造器的入参类型为对象字面量
    constructor(props: {}) {
        super(props);
        this.state = {gameState: ""};
    }
    
    // CustomEvent是内建类型，即自定义事件
    private handleGameStateChange(e: CustomEvent) {
        this.setState({gameState: e.detail});
    }
  
    // Event是内建类型，即普通事件
    private handleRestart(e: Event) {
        this.setState({gameState: ""});
    }

    componentDidMount() {
        window.addEventListener("gameStateChange", (e: CustomEvent) => this.handleGameStateChange(e));
        window.addEventListener("restart", (e: CustomEvent) => this.handleRestart(e));
    }

    componentWillUnmount() {
        window.removeEventListener("gameStateChange", (e: CustomEvent) => this.handleGameStateChange(e));
        window.removeEventListener("restart", (e: CustomEvent) => this.handleRestart(e));
    }
    
    render() {
        return (
            <div className="gameStateBar"> {this.state.gameState} </div> 
        )
    }
}   
