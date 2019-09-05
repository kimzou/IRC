import React, {useState} from 'react';
import SocketCxt from './context/SocketContext';
import './css/style.css';
import io from "socket.io-client";
import Chat from './components/Chat';
import Connection from './components/Connection';


const socket = io('127.0.0.1:3000')
function App() {
  
  const [user, setUser] = useState('');
    
  socket.on('add user', username => {
    setUser(username);  
  });

  return (
    <>
      <SocketCxt.Provider value={socket}>
        {user === '' ? <Connection socket={socket} /> : <Chat user={user} />}
      </SocketCxt.Provider>
    </>
  );
}

export default App;
