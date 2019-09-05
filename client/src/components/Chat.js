import React, {useEffect, useContext, useState} from 'react';
import SocketCxt from '../context/SocketContext';
import FormChat from './FormChat';
import MessageDisplay from './MessageDisplay';
import Channels from './Channels';

function Chat(props) {
  const socket = useContext(SocketCxt);
  const [room, setRoom] = useState('home');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    socket.emit('get room');
    socket.on('get room', room => 
      setRoom(room)
    );
  }, [socket, room]);
  
  socket.on('add message', data => 
    setChatHistory([...chatHistory, data])
  );

  let data = {};
  let msg = chatHistory.filter(obj => {
    if(obj.room ===  room || obj.room === 'all') {
      data = {username: obj.username, message: obj.message};
      return data;
    }
  });

  return (
    <>
      <h1 className='text-center mt-3'>
        Channel {room}
      </h1>
      <SocketCxt.Consumer>
        {socket => (
          <>
            <FormChat socket={socket} user={props.user} room={room} />
            <div className='row'>
              <Channels socket={socket} />
              <MessageDisplay socket={socket} message={msg}/>
            </div>
          </>
        )}
      </SocketCxt.Consumer>
    </>
  )
}

export default Chat;