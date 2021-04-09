/* eslint-disable */
import React, { Component, useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  AppBar,
  Backdrop,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import assert from 'assert';
import './ChatScreen.css';
import ChatItem from "./ChatItem";
import { Message } from "../../CoveyTypes";

interface ScreenProps {
  playerName: string,
  token: string,
  coveyTownID: string
}

const ChatScreen: React.FunctionComponent<ScreenProps> = (props) => {
  const [count, setCount] = useState(0);
  const [newMessage, setNewMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<Message>>([]);
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);
  const increment = () => {
    setCount(count + 1);
  };
  const playerName: string = props.playerName;
  const token: string = props.token;
  const coveyTownID: string = props.coveyTownID;
  const [loading, setLoading] = useState<boolean>(false);

  const socket = io(url, { auth: { token: token, coveyTownID: coveyTownID } });

  const styles = {
    textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
    textFieldContainer: { flex: 1, marginRight: 12 },
    gridItem: { paddingTop: 12, paddingBottom: 12 },
    gridItemChatList: { overflow: "auto", height: "70vh" },
    gridItemMessage: { marginTop: 12, marginBottom: 12 },
    sendButton: { backgroundColor: "#3f51b5" },
    sendIcon: { color: "white" },
    mainGrid: { paddingTop: 100, borderWidth: 1 },
  } as const;

  const sendMessage = () => {
    socket.emit("message", {author: playerName,
      dateCreated: new Date(),
      body: newMessage});
  };

  const scrollDiv = React.useRef(document.createElement("div"));

  const scrollToBottom = () => {
    const height = scrollDiv.current.clientHeight;
    const maxScrollTop = scrollDiv.current.scrollHeight - height;
    scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  };

  const handleMessageAdded = (message: any) => {
    setMessages(!!messages ? [...messages, message] : [message]);
    scrollToBottom();
  };

  useEffect(() => {
      const messageListener = () => {
        socket.on("message", function (data: any) {
          console.log(data);
          handleMessageAdded(data);
        });
      };
      messageListener();
  });

  // return (
  //   <div>
  //     <body>
  //       <div className='heading'>Chat Box</div>
  //       {/* <div className='mbox'>
  //         <ul id="messages" />
  //       </div> */}
  //       <Grid container direction="column" style={styles.mainGrid}>
  //         <Grid item style={styles.gridItemChatList} ref={scrollDiv}>
  //           <List dense={true}>
  //             {messages &&
  //               messages.map((message) => (
  //                 <ChatItem
  //                   message={message}
  //                   playerName={playerName}
  //                 />
  //               ))}
  //           </List>
  //         </Grid>
  //       </Grid>
  //       <form id="form" action="">
  //         <input id="input" autoComplete="off" placeholder="Type your message here"
  //           value={newMessage}
  //           onChange={event => setNewMessage(event.target.value)}
  //         />
  //         <button type='submit' onClick={sendMessage} >Send</button>
  //       </form>
  //     </body>
  //   </div>
  // );

  return <>
  <Container component="main" maxWidth="md">
    <Backdrop open={loading} style={{ zIndex: 99999 }}>
      <CircularProgress style={{ color: "white" }} />
    </Backdrop>
    <AppBar elevation={10}>
      {/* <Toolbar>
        <Typography variant="h6">
          {`Town: '', User: ${playerName}`}
        </Typography>
      </Toolbar> */}
    </AppBar>
    <CssBaseline />
      <Grid container direction="column" style={styles.mainGrid}>
        <Grid item style={styles.gridItemChatList} ref={scrollDiv}>
          <List dense={true}>
            {messages &&
              messages.map((message) => (
                <ChatItem
                  message={message}
                  playerName={playerName}
                />
            ))}
          </List>
        </Grid>
      <Grid item style={styles.gridItemMessage}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
        <Grid item style={styles.textFieldContainer}>
        <TextField
          required
          style={styles.textField}
          placeholder="Enter message"
          variant="outlined"
          multiline
          rows={2}
          value={newMessage}
          // disabled={!channel}
          onChange={(event) => {
              setNewMessage(event.target.value);
            }
          }
        />
      </Grid>
      <Grid item>
        <IconButton
          style={styles.sendButton}
          onClick={sendMessage}
          // disabled={!channel || !text}
        >
      <Send style={styles.sendIcon} />
      </IconButton>
      </Grid>
    </Grid>
    </Grid>
  </Grid>
  </Container>
</>
};
export default ChatScreen