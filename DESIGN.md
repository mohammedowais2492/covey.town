## Architecture Diagram

![High Level Architecture Diagram](https://github.com/mohammedowais2492/covey.town/blob/master/HLAD.jpeg)

- As seen in the diagram, we are implementing the chat feature by extending existing socket library. The `Text Chat Client` component renders the chat box UI towards the right side of the map. When a user types a message, it is then sent to a `Rooms Service Socket Client` (`useChat` hook) which sends the message payload as a `socket.emit()` to the backend component. 
- The backend component's `Request Handler` gets the message payload from the client and sends it to the `Controller`. The controller forwards the message to each of the `Listeners` in the component which then calls `socket.emit()` sending the message back to the client. 


## CRC cards
![CRC1](https://github.com/mohammedowais2492/covey.town/blob/master/CRC1.png)

![CRC2](https://github.com/mohammedowais2492/covey.town/blob/master/CRC2.png)

![CRC3](https://github.com/mohammedowais2492/covey.town/blob/master/CRC3.png)

![CRC4](https://github.com/mohammedowais2492/covey.town/blob/master/CRC4.png)

## Description

- We implemented the chat-feature for the covey town application by using the socket.io library. As seen in the architectural diagram, we have extended the socket library to also handle messages sent via the chat box. 
-
#### Front-End changes
- We created a new React component `ChatScreen.tsx` that renders the chatbox next to the map. This component is plugged into the UI from the `App.tsx` render method. 
- The `ChatScreen` component also shows a dropdown list which lists all the players in the current covey room. 
- User can send messages to `Everyone` or a specific person in the room (as a private chat) using this dropdown list.
- The UI also shows nearby players right below the dropdown that list all the players that are nearby to the current player. The user can click on one of the nearby players to chat with him/her directly.
- We have used the `useCoveyAppState` hook to fetch all the required information related to the context of the given room.


#### Backend Changes
- The backend functionality is implemented by extending the socket library to include the option to listening for incoming chat messages from the client. This is done by extending the `townSubscriptionHandler`.
- We also added a new method to update messages to each of the player in the room using the `Listener pattern`. This is done in `CoveyTownController.ts`
- We further extended the `CoveyTownListener` interface to include `onPlayerChatted()` which sends back the message payload back to the client. 
- At a high level, the way we differentiate the groupChat vs privateChat is by chosing to include a reciever in the message payload or not.


#### Existing code changes
We did not change any of the existing code. We simply extended existing functionality to support incoming messages. 
- On the backend, the files that were modified was: 
    - `townSubscriptionHandler()` to add a socket for listening for incoming messages from the client
    - `CoveyTownListener` interface to include a new method for handling messages
    - A new method in `CoveyTownController` to registers listeners
- On the frontend, we extended the `appStateReducer()` and the `GameController()` to include actions for `playerChatted`

#### Alternatives
- We also tried sending messages using the `Twilio Chat Service API` but we faced difficulty in sending the messages to the backend and so we switched to sockets.
- We were initially using `socket.io` capabilities to implement group vs private chat. But we got a feedback to use Listeners pattern which we have implemented for this feature
