const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var users = [];
var rooms = [{name: 'home', owner: 'bot', users: []}];
var usernameTaken = false;

io.on('connection', socket => {
  socket.on('new user', user => {
    usernameTaken = users.some(function(obj) { 
      return obj.username === user; 
    })

    if (usernameTaken || user === 'bot') {
      socket.emit('user taken', 'Ce pseudo est déjà pris !');
      usernameTaken = false;
      return;
    } else if (user === '') {
      socket.emit('user taken', 'Veuillez rentrer un psuedo !');
      return;
    }

    socket.username = user;
    socket.currentRoom = 'home';
    users.push({username: user, id: socket.id});
    rooms[0].users.push(user);
    socket.join('home');
    socket.emit('add user', user);
    socket.emit('add message', {room: 'home', username: 'bot', message: 'Vous venez de rejoindre le channel ' + socket.currentRoom});
    socket.to('home').emit('add message', {room: 'home',username: 'bot', message: user + ' à rejoint le channel ' + socket.currentRoom + ' !'});
  });

  socket.on('change username', (username, newUsername) => {
    let userAlreadyExists = false; 

    if (newUsername === username) {
      socket.emit('add message', {username: 'bot', message: 'Mais c\'est déjà votre pseudo :o'});
      return;
    }

    for (let obj of users) {
      if (obj.username === newUsername) {
        socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Ce pseudo est déjà pris !'});
        userAlreadyExists = true;
        break;
      }
    }

    if (userAlreadyExists) return;

    for (let obj of users) {
      if (obj.username === socket.username) {
        obj.username = newUsername;
        break;
      }
    }

    let userIndex = 0;
    let objIndex = 0;
    let roomsIn = [];
    for (let obj of rooms) {
      if(objIndex >= 1) userIndex = 0;
      userAlreadyExists =  obj.users.some(user => {
        if (user === newUsername) {
          return true;
        }
      });

      for (let user of obj.users) {
        if (userAlreadyExists) {
          socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Ce pseudo est déjà pris !'});
          break;
        } else if (user === username) {
          socket.username = newUsername;
          socket.emit('add user', newUsername);
          obj.users[userIndex] = newUsername;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
          break;
        }
        userIndex++;        
      }
      if(obj.owner === username) {
        obj.owner = newUsername
      }
      objIndex++;
      roomsIn.push(obj.name);
    }
    
    roomsIn.forEach(room => 
      socket.to(room).emit('add message', {room: socket.currentRoom, username: 'bot', message: username + ' à changé son pseudo en ' + newUsername}
    ));
  });

  socket.on('delete room', (user, room) => {
    let objIndex = 0;
    let channelExist = false;
    for (let obj of rooms) {
      if (obj.name === room) {
        channelExist = true;
        if (obj.owner === user) {
          rooms.splice(objIndex, 1);
          socket.leave(room);
          io.emit('add message', {room: 'all', username: 'bot', message: 'Le channel ' + room + ' vient d\'être supprimé'});
          
          let roomsIn = [];
          rooms.forEach(room => {
            if (room.name !== 'home') {
              roomsIn.push(room.name);
            }
          });

          io.emit('rooms update', roomsIn);
          socket.emit('get room', 'home');
          socket.currentRoom = 'home';
          break;
        } else {
          socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Vous n\'êtes pas le créateur de ce channel, vous ne pouvez donc pas le supprimer'});
          break;
        }
      }
      objIndex++;
    }
    if (!channelExist) socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Ce channel n\'existe pas, utilisez la commande \'/list\' pour voir les channels disponibles'});
  })

  socket.on('display rooms', () => {
    let roomsIn = [];
    rooms.forEach(room => {
      if (room.name !== socket.currentRoom) {
        roomsIn.push(room.name);
      }
    });
  });
    
  socket.on('display users', () => 
    io.to(socket.currentRoom).emit('users update', users)
  )
  
  socket.on('new message', data => {
    io.in(socket.currentRoom).emit('add message', data);
  });

  socket.on('create room', (user, newRoom) => {
    let roomAlreadyExists;
    for(let obj of rooms) {
      if (obj.name === newRoom) {
          socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Ce channel existe déjà, pour le rejoindre, utilisez la commande \'/join\' suivi de son nom'});
          roomAlreadyExists = true;
        break;
      }
    }

    if(roomAlreadyExists) return;

    socket.join(newRoom);
    io.emit('add message', {room: 'all', username: 'bot', message: user +' vient de créer le channel ' + newRoom})
    socket.emit('add message', {room: newRoom ,username: 'bot', message: 'Vous venez de rejoindre le channel ' + newRoom});
    rooms.push({name: newRoom, owner: user, users: [user]});      
    socket.emit('get room', newRoom);
    socket.currentRoom = newRoom;
    
    let roomsIn = [];
    rooms.forEach(room => {
      if (room.name !== socket.currentRoom) {
        roomsIn.push(room.name);
      }
    });

    socket.emit('rooms update', roomsIn);
  })

  socket.on('rooms list', roomToFind => {
    let roomsName = [];
    rooms.forEach(room => {
      roomsName.push(room.name);
    })

    if (roomToFind === null) {
      socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: roomsName});
    } else {
      let roomFilter = roomsName.filter(room => {
        return RegExp(roomToFind).test(room);
      });

      if(roomFilter.length === 0) {
        socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Aucun channel ne contient le mot ' + roomToFind});
        return;
      }

      socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: roomFilter});
    }
  });

  socket.on('users list', () => {
    for (let obj of rooms) {
      if (obj.name === socket.currentRoom) {
        socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: obj.users});
      }
    }
  })

  socket.on('join room', (user, newRoom) => {
    let roomAlreadyExists = false;
    for(let obj of rooms) {
      if (obj.name === newRoom) {
        obj.users.push(user);
        roomAlreadyExists = true;
        break;
      }
    }

    if(!roomAlreadyExists) {
      socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Ce channel n\'existe pas, pour le créer, utilisez la commade \'/create\' suivi du nom'});
      return;
    }

    socket.emit('get room', newRoom);
    socket.currentRoom = newRoom;
    socket.join(newRoom);
    socket.emit('add message', {room: newRoom ,username: 'bot', message: 'Vous venez de rejoindre le channel ' + newRoom});
    socket.to(newRoom).emit('add message', {room: newRoom, username: 'bot', message: user + ' a rejoint le channel ' + newRoom});
    
    let roomsIn = [];
    rooms.forEach(room => {
      if (room.name !== socket.currentRoom) {
        roomsIn.push(room.name);
      }
    });
    socket.emit('rooms update', roomsIn);
  });

  socket.on('current room', room => {
    socket.currentRoom = room;
    socket.emit('get room', room);

    let roomsIn = [];
    rooms.forEach(room => {
      if (room.name !== socket.currentRoom) {
        roomsIn.push(room.name);
      }
    });

    socket.emit('rooms update', roomsIn);
  });

  socket.on('wrong command', () => 
    socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Cette commande n\'existe pas'})
  );
  
  socket.on('leave room', room => {
    if (room === 'home') {
      socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Vous ne pouvez pas quitter le channel home'});
      return;
    }

    io.to(room).emit('add message', {room: room, username: 'bot', message: socket.username + ' à quitté le channel ' + room + ' :('});
    socket.leave(room);

    for(let obj of rooms) {
      if (obj.name === room) {
        let userIndex = obj.users.findIndex(user => {
          return user === socket.username;
        });
        obj.users.splice(userIndex, 1);
        break;
      }
    }

    let roomsIn = [];
    rooms.forEach(room => {
      if (room.name !== 'home' && room.name !== socket.currentRoom) {
        roomsIn.push(room.name);
      }
    });

    socket.emit('rooms update', roomsIn);
    socket.emit('get room', 'home');
    socket.currentRoom = 'home';
  });

  socket.on('private msg', (to, msg) => {
    let recipientId;
    for (let obj of rooms) {
      if (obj.name === socket.currentRoom) {
        obj.users.forEach(user => {
          if (user === to) {
            for (let user of users) {
              if (user.username === to) {
                recipientId = user.id;
                break;
              }    
            }
          }
        });
      }
    }

    if (recipientId === undefined) {
      socket.emit('add message', {room: socket.currentRoom, username: 'bot', message: 'Soit cet utilisateur n\'existe pas, soit cet utilisateur n\'est pas connecté au channel, utilisez la commande \'/users\' pour voir la liste des utilisateurs'});
      return;
    }

    io.to(recipientId).emit('add message', {room: 'all', username: 'bot', message: to + ' vous chuchote : * ' + msg +'*'})
  })

  socket.on('disconnect', data => {
    users.forEach((obj, i) => {
      users.splice(i, 1);
    });

    let userIndex;
    rooms.forEach(obj => {
        userIndex = obj.users.findIndex(user => {
          return user === socket.username;
        })
        obj.users.splice(userIndex, 1);
    });
  });

  socket.on('error', err => console.error(err))

});

http.listen(3000, () => console.log('listening on *:3000'));