var app = {
  server: 'https://api.parse.com/1/classes/messages',
  friendsList: {},
  currentMessages: []
};

app.init = function () {

};

app.send = function(message) {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};
app.fetch = function () {

  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: this.server,
    type: 'GET',
    data: 'string',
    contentType: 'application/json',
    success: function (data) {
      // results = data.results;
      // console.log(data.results);
      app.grabServerMessages(data.results);
      console.log('chatterbox: Message retrieved!');
    },
    error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to retrieve new messages', data);
    }
  });
};

app.grabServerMessages = function (serverMessages) {
  this.clearMessages();
  this.currentMessages = serverMessages;
  for (var i = this.currentMessages.length - 1; i >= 0; i--) {
    this.addMessage(this.currentMessages[i]);
  }
};


app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  // console.log('message', message);
  var username = '<span class=username>' + message.username + '</span>';
  $('#chats').prepend('<div class=chat>' + username + ': ' + message.text + '</div>');
};

app.addRoom = function(roomName) {
  $('#roomSelect').append('<option class=room>' + roomName + '</option>');
};

app.addFriend = function(newFriend) {
  this.friendsList[newFriend] = newFriend;
};

$(document).on('click', '.username', function(event) {
  var newFriend = $(this).text();
  app.addFriend(newFriend);
  event.preventDefault();
});

app.handleSubmit = function(message) {
  var user = window.location.search.slice(10);
  var room = $('#roomSelect').val();
  var obj = {
    username: user,
    text: message,
    roomname: room
  };
  this.send(obj);
  this.addMessage(obj);
};

$(document).on('submit', '#send', function( event ) {
  var message = $('input').val();
  app.handleSubmit(message);
  event.preventDefault();
});

// setInterval(function() {
//   console.log('fetching!');
//   console.log(app.fetch());
// }, 3000);

$(document).on('click', '#update', function(event) {
  app.fetch();
});