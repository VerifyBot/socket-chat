var socket = io();

userId = null
function getAllIds() {
  return JSON.parse(localStorage.getItem('ids')) || [];
}


socket.on('get_user_id', resp => {
  if (userId) return;  // If you already have an ID you don't need one
  userId = resp.userId;
  allIds = getAllIds();
  allIds.push(userId)
  localStorage.setItem('ids', JSON.stringify(allIds));
  messages = resp.messages;
  console.log(`Your userId=${userId} | Loading ${messages.length} messages`);
  messages.forEach(msg => {
    createMessage(msg.content, msg.date, msg.authorId);
  });
});

socket.on('users_count', resp => {
  usersCount = Number(resp.usersCount);
  if (usersCount !== Number($('#online-count').text())) {
    $('#online-count').text(resp.usersCount);
  }
});

setInterval(() => {
  socket.emit('get_users_count');
}, 500);

socket.emit('get_users_count');


$('#send').click(ev => {
  content = $('#msg').val();
  if (content.length === 0) return;
  $('#msg').val('');
  socket.emit('create_message', {content: content});
});

socket.on('new_message', resp => {
  console.log(resp);
  createMessage(resp.content, resp.date, resp.authorId);
});

function createMessage(content, date, author) {
  isMe = getAllIds().includes(author);
  date = dayjs(date).format("DD/MM/YY hh:mm:ss");
  $('#messages').append(`<li class="msg${isMe ? ' me' : ''}"><span class="date">${date}</span><span class="text"></span></li>`);
  $('.msg .text').last().text(content);
}

// $('form').submit(function () {
//   socket.emit('chat message', $('#m').val());
//   $('#m').val('');
//   return false;
// });

// socket.on('chat message', function (msg) {
//   $('#messages').append($('<li>').text(msg));
//   window.scrollTo(0, document.body.scrollHeight);
// });