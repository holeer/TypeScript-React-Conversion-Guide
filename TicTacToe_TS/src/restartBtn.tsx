import React from "react";

export const RestartBtn: React.FC = () => {
    // Fire a global event notifying restart of game
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        var event = document.createEvent("Event");
        event.initEvent("restart", false, true); 
        window.dispatchEvent(event);
    }

    return (
        <a href="#" className="restartBtn" onClick={e => handleClick(e)}>
            Restart 
        </a>
    );
}
