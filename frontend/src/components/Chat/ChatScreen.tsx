import React, { Component,useState } from "react";
import {io} from "socket.io-client";
import './ChatScreen.css';

const SERVER = "http://localhost:8081";
const ChatScreen = () => {

  const socket = io(SERVER, {transports: ['websocket']});
  socket.on('connection1', () => {
        console.log(`I'm connected with the back-end`);
  });

  const [newMessage, setNewMessage] = useState<string>('');

  const sendMessage = () => {
    socket.emit("message", {body: newMessage});
  };

  return (
    <div>
        <body>
          <div className='heading'>Chat Box</div>
          <div className='mbox'>
              <ul id="messages"/>
          </div>
          <form id="form" action="">
            <input id="input" autoComplete="off" 
            value={newMessage}
            onChange={(event) => {setNewMessage(event.target.value)}}
            />
            <button type="button" onClick={sendMessage} >Send</button>
          </form>
        </body>
    </div>
  );

};
export default ChatScreen