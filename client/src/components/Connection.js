import React, {useState, useContext, useEffect} from 'react';
import SocketCxt from '../context/SocketContext';

function Connection() {
  
  const socket = useContext(SocketCxt); 
  const [user, setUser] = useState('');
  const [username, setUsername] = useState('')

  const handleSubmit = e => {
    e.preventDefault();
    socket.emit('new user', user);
  }

  useEffect(() => {
    socket.on('user taken', msg => {
      setUsername(msg)
    })
  }, [socket]);

  return ( 
    <>
      <form id='loginForm' onSubmit={handleSubmit}>
        <label htmlFor='loginInput'>Choisissez votre pseudo</label>
        <input type='text' id='loginInput' name='login' onChange={(e) => setUser(e.target.value)}/>
        <small className='text-danger'>{username}</small>
      </form>
    </>
  )
}

export default Connection;