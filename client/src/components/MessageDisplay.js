import React from 'react';

function MessageDisplay(props) {
  
  const chatHistory = props.message;

  return (
    <div className='col-8'>
      <ul id='chatMsg'>
        {chatHistory.map((msg, index) => 
          <li key={index}>
            <span className={msg.username === 'bot' ? 'font-weight-bold text-danger' : 'font-weight-bold'}>{msg.username} : </span>
            <span className={msg.username === 'bot' ? 'font-weight-light font-italic' : ''}>
              {Array.isArray(msg.message) ? msg.message.map(elt => <li>{elt}</li>) : msg.message}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}

export default MessageDisplay;