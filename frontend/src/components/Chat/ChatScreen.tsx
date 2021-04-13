import React, { useEffect, useState, useRef } from "react";
import { Socket } from 'socket.io-client';
import {
  IconButton, ListItem, TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { Select } from '@chakra-ui/react';
import useCoveyAppState from "../../hooks/useCoveyAppState";
import './ChatScreen.css';

const NEW_CHAT_MESSAGE_EVENT = "groupMessage"; // Name of the event
// const SOCKET_SERVER_URL = "http://localhost:8081";

const useChat = (coveyTownID: string, socket: Socket) => {
  const [messages, setMessages] = useState<MsgFormat[]>([]);
  const [sentTo, setSentTo] = useState('everyone');
  const [sentBy, setSentBy] = useState('');
  const [privateMessages, setMessagesPrivate] = useState<MsgFormatPrivate[]>([]); // Sent and received messages
  const socketRef = useRef(socket);

  const {
    userName
  } = useCoveyAppState();

  useEffect(() => {

    // Listens for incoming messages
    socketRef?.current?.on(coveyTownID, (message: any) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current?.id,
      };
      setMessages((msgs) => [...msgs, incomingMessage]);
    });

    socketRef?.current?.on(`${coveyTownID}'private'`, (message: any) => {
      const incomingMessage = {
        ...message,
        ownedByCurrentUser: message.senderId === socketRef.current?.id,
      };
      setMessagesPrivate((msgs) => [...msgs, incomingMessage]);
      setSentTo(message.sentTo);
      console.log('sender: ',message.sentBy)
      setSentBy(message.sentBy);
    });

    // Destroys the socket reference
    // when the connection is closed
    // return () => {
    //   socketRef.current.disconnect();
    // };
  }, [coveyTownID]);

  // useEffect(() => {

  //   // Listens for incoming messages
  //   socketRef?.current?.on(`${coveyTownID}'private'`, (message: any) => {
  //     const incomingMessage = {
  //       ...message,
  //       ownedByCurrentUser: message.senderId === socketRef.current?.id,
  //     };
  //     setMessagesPrivate((msgs) => [...msgs, incomingMessage]);
  //   });

  //   // Destroys the socket reference
  //   // when the connection is closed
  //   // return () => {
  //   //   socketRef.current.disconnect();
  //   // };
  // }, [coveyTownID]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  // const sendMessage = (receiver: string, messageBody: string) => {
  //   socketRef.current.emit(coveyTownID,{
  //     body: messageBody,
  //     senderId: socketRef.current.id,
  //     ownedByCurrentUser: true,
  //     userName,
  //     dateCreated: new Date(),
  //     sentTo: receiver
  //   });

  //   // socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, messageBody) ;

  // };

  const sendMessage = (messageBody: string) => {
    socketRef.current.emit(coveyTownID,{
      body: messageBody,
      senderId: socketRef.current.id,
      ownedByCurrentUser: true,
      userName,
      dateCreated: new Date()
    });
  };

  const sendMessagePrivate = (receiver: string, sender: string, messageBody: string) => {
    socketRef.current.emit(`${coveyTownID}'private'`,{
      body: messageBody,
      senderId: socketRef.current.id,
      ownedByCurrentUser: true,
      userName,
      dateCreated: new Date(),
      sentTo: receiver,
      sentBy: sender
    });
  };

  return { sentTo, sentBy , messages, sendMessage, privateMessages, sendMessagePrivate };
};

type MsgFormat = {
  body: string,
  senderId: string,
  ownedByCurrentUser: boolean,
  userName: string,
  dateCreated: Date
}

type MsgFormatPrivate = {
  body: string,
  senderId: string,
  ownedByCurrentUser: boolean,
  userName: string,
  dateCreated: Date,
  sentTo: string
}

const ChatScreen = () => {

  const {
    players, myPlayerID, currentTownID, socket, userName
  } = useCoveyAppState();

  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('everyone');
  const { sentTo, sentBy, messages, sendMessage, privateMessages, sendMessagePrivate } = useChat(currentTownID, socket as Socket);
  const styles = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    sendButton: { backgroundColor: "#3f51b5" },
    sendIcon: { color: "white" },
  } as const;

  // console.log('private: ',privateMessages);
  // console.log('player: ',myPlayerID)
  console.log('Player: ',myPlayerID)

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if(receiver ===  'everyone') {
      sendMessage(newMessage);
    } else {
      sendMessagePrivate(receiver,myPlayerID,newMessage); 
    }
    // reset message to empty once sent
    setNewMessage('');
  }

  const estyles = {
    listItem: (isOwnMessage: boolean) => ({
      flexDirection: "column",
      alignItems: isOwnMessage ? "flex-end" : "flex-start",
    }) as const,
    container: (isOwnMessage: boolean) => ({
      maxWidth: "100%",
      borderRadius: 10,
      padding: 6,
      color: "white",
      fontSize: 14,
      backgroundColor: isOwnMessage ? "#054740" : "#262d31",
    }),
    author: { fontSize: 10, color: "gray" },
    timestamp: { fontSize: 8, color: "white", textAlign: "right", paddingTop: 4 } as const,
  };

  return (
    <div>
      <body>
        <div className='heading'>Chat Box</div>
        <div className='mbox'>
          <Select onChange={(e) => setReceiver(e.target.value)}>
            <option value="everyone">Everyone</option>
            {players.filter(player => player.id !== myPlayerID).map(player => <option key={player.userName} value={player.id}> {player.userName} </option>)}
          </Select>
          <ol>
            {messages.map((message) => (
              // <li
              //   key={JSON.stringify(message)}
              // // className={`message-item ${
              // //   message.ownedByCurrentUser ? "my-message" : "received-message"
              // // }`}
              // >
              //   {message.body}
              // </li>
              <ListItem
                key={JSON.stringify(message)}
                style={estyles.listItem(message.ownedByCurrentUser)}>
                <div style={estyles.author}>{message.userName}</div>
                <div style={estyles.container(message.ownedByCurrentUser)}>
                  {message.body}
                  {/* <div style={estyles.timestamp}>
                  {message.dateCreated.toISOString()}
                </div> */}
                </div>
              </ListItem>
            ))}
          </ol>
          { (myPlayerID === sentTo || myPlayerID === sentBy) &&
            <ol>
            {privateMessages.map((message) => (
              // <li
              //   key={JSON.stringify(message)}
              // // className={`message-item ${
              // //   message.ownedByCurrentUser ? "my-message" : "received-message"
              // // }`}
              // >
              //   {message.body}
              // </li>
              <ListItem
                key={JSON.stringify(message)}
                style={estyles.listItem(message.ownedByCurrentUser)}>
                <div style={estyles.author}>Private: {message.userName}</div>
                <div style={estyles.container(message.ownedByCurrentUser)}>
                  {message.body}
                  {/* <div style={estyles.timestamp}>
                  {message.dateCreated.toISOString()}
                </div> */}
                </div>
              </ListItem>
            ))}
          </ol>
          }
        </div>
        <form id="form">
          <input id="input"
            placeholder="Write message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)} />
          {/* <button type='submit' onClick={(e)=> handleSubmit(e)}>Send</button> */}
          <IconButton
            style={styles.sendButton}
            onClick={(e) => handleSubmit(e)}
          >
            <Send style={styles.sendIcon} />
          </IconButton>
        </form>
      </body>
    </div>
  );
};
export default ChatScreen;
