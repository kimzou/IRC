import React, {useState, useContext} from 'react';
import SocketCxt from '../context/SocketContext';

function FormChat(props) {
  
  const socket = useContext(SocketCxt);
  const user = props.user;
  const [msg, setMsg] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    
    if (msg === '') return;

    if (/^\/.+/.test(msg)){
      socket.emit('command');
      checkCommands(msg, socket, user);
      setMsg('');
      return;
    }

    socket.emit('new message', {room: props.room ,message : msg, username: user});
    setMsg('');
  }

  function checkCommands (msg, socket, user) {
    let input = msg.split(' ');
    let cmd = input[0];
    let arg = input[1];
    let message = '';

    if(input.length > 2) {
      for (let i = 2; input.length > i; i++) {
        message = message.concat(input[i], ' ');
      }
    }
    
    switch (cmd) {
      case '/nick':
        socket.emit('change username', user, arg);
        break;
      case '/create':
        socket.emit('create room', user, arg);
        break;
      case '/delete':
        socket.emit('delete room', user, arg);
        break;
      case '/part':
        socket.emit('leave room', arg);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        break;
      case '/join':
        socket.emit('join room', user, arg);
        break;
      case '/users':
        socket.emit('users list');
        break;
      case '/list':
        socket.emit('rooms list', arg);
        break;
      case '/msg':
        socket.emit('private msg', arg, message);
        break;
      default:
        socket.emit('wrong command');
        break;
    }
  }

  return (
    <>
      <form id='chatForm' onSubmit={handleSubmit}>
          <label htmlFor='chatInput'>{user}</label>
          <input type='text' id='chatInput' value={msg} onChange={e => setMsg(e.target.value)}/>
       </form>
    </>
  )
}

export default FormChat;