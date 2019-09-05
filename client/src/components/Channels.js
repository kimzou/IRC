import React, {useState, useEffect, useContext} from 'react';
import SocketCxt from '../context/SocketContext';

function Channels() {
  
  const socket = useContext(SocketCxt);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.emit('display rooms');
    socket.on('rooms update', roomName => {
      setRooms(roomName);
    });
  }, [socket]);
  

  return (
    <div id='channels' className='col-2'>
      <h3 className='text-center'>Liste des channels</h3>
      <ul>
        {rooms.length !== 0 ? 
          rooms.map((room, index) =>
            <li key={index}>
              <a href='#' className='btn btn-dark mt-2' onClick={() => socket.emit('current room', room)}>{room}</a>
            </li>
          ) : <p className='font-weight-light font-italic'>Vous n'avez pas encore rejoint d'autres channels</p>}
      </ul>
    </div>
  )
}

export default Channels;