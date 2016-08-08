// YOUR CODE HERE:
var app = {
  server: 'https://api.parse.com/1/classes/messages',
  friendsList: {}
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

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  var username = '<span class=username>' + message.username + '</span>';
  $('#chats').append('<div class=chat>' + username + ': ' + message.text + '</div>');
};

app.addRoom = function(roomName) {
  $('#roomSelect').append('<option class=room>' + roomName + '</option>');
};

app.addFriend = function(newFriend) {
  this.friendsList[newFriend] = newFriend;
};

$(document).on('click', '.username', function() {
  app.addFriend($(this).text());
});

app.handleSubmit = function() {
  
};

$(document).on('submit', '#send', function( event ) {
  console.log('submitting');
  event.preventDefault();
});