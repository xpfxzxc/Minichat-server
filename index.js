const io = require('socket.io')(
  process.env.PORT || 60300,
  { origins: process.env.NODE_ENV === 'production' ? 'xpfxzxc.github.io:443' : '*:*' }
);

const nickname_map = new Map();

io.on('connection', (socket) => {
  nickname_map.set(socket.id, null);
  console.log(`某人加入，目前 ${nickname_map.size} 人在线`);

  socket.on('disconnect', () => {
    const nickname = nickname_map.get(socket.id);
    nickname_map.delete(socket.id);
    io.emit('public chat user out', nickname, nickname_map.size);
    io.emit('public chat online-list delete', nickname);
    console.log(`${nickname} 离开，目前 ${nickname_map.size} 人在线`);
  });

  socket.on('set_nickname', (nickname, ack) => {
    ack();
    nickname_map.set(socket.id, nickname);
    console.log(`The nickname of socket ${socket.id} is ${nickname}`);
  });

  socket.on('public chat user in', () => {
    io.emit('public chat user in', nickname_map.get(socket.id), nickname_map.size);
    io.emit('public chat online-list add', nickname_map.get(socket.id));
  });

  socket.on('public chat text', (msg, ack) => {
    ack();
    console.log(`广播消息：${msg.content}`);
    socket.broadcast.emit('public chat text', {
      content: msg.content,
      source: nickname_map.get(socket.id)
    });
  });

  socket.on('public chat image', (msg, ack) => {
    ack();
    console.log(`广播图片`);
    socket.broadcast.emit('public chat image', msg);
  });

  socket.on('get public chat online-list', ack => ack(Array.from(nickname_map.values())));
});