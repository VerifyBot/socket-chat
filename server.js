var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static('.'))
app.get('*', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

users = [];
messages = [];

io.on('connection', (socket) => {
  const userId = socket.id;
  users.push(userId)
  io.emit('get_user_id', {userId: userId, messages: messages});
  console.log(`Added ${userId} (now ${users.length} users)`);

  socket.on('disconnect', () => {
    let idx = users.indexOf(userId);
    users.splice(idx, 1);
    console.log(`Removed ${userId} (now ${users.length} users)`);
  });

  socket.on('get_users_count', () => {
    socket.emit('users_count', {usersCount: users.length});
  });
  
  socket.on('create_message', resp => {
    if (resp.content.length === 0) return;
    console.log(`Got a new message: ${resp.content}`);
    messages.push({
      content: resp.content.trim(),
      date: Date.now(),
      authorId: userId
    });
    console.log(`Sending to clients: ${Array.from(messages).pop()}`);
    io.emit('new_message', Array.from(messages).pop());
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});