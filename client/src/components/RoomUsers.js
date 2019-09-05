import React, {useContext, useEffect, useState} from 'react';
import SocketCxt from '../context/SocketContext';

function RoomUsers() {

  const socket = useContext(SocketCxt);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.emit('display users');
    socket.on('users update', users => {
      setUsers(users);
    });
  }, []);

  return (
    <>
      <h3 className='text-center'>Utilisateurs connectés</h3>
      <ul id='users'>
        {users.map((users, index) => 
          <li key={index}>
            <a href='#' className='btn btn-light'>{users.username}</a>
          </li>
        )}
      </ul>
    </>
  )
}

export default RoomUsers;