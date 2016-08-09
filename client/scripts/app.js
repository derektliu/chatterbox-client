var app = {
  server: 'https://api.parse.com/1/classes/messages',
  friendsList: {},
  currentMessages: [],
  presentRoom: 'lobby',
  currentRooms: {lobby: 'lobby'}
};

app.init = function () {
};


/*************************** SERVER FUNCTIONS ********************************/
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
      //console.log(data.results);
      app.grabServerMessages(data.results);
      console.log('chatterbox: Message retrieved!');
    },
    error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to retrieve new messages', data);
    }
  });
};
/*****************************************************************************/

/**************************CHAT BOX*****************************************/
app.grabServerMessages = function (serverMessages) {
  this.clearMessages();
  this.currentMessages = serverMessages;
  this.populateChat(this.currentMessages);
  this.filterRooms(this.presentRoom);

};

app.populateChat = function(allMessages) {
  for (var i = allMessages.length - 1; i >= 0; i--) {
    this.addMessage(allMessages[i]);
    this.addRoom(allMessages[i]);
  }
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  // console.log('message', message);
  var username = '<span class=username>' + message.username + '</span>';
  if (this.friendsList[message.username]) {
    $('#chats').prepend('<div class="chat friend">' + username + ': ' + message.text + '</div>');
  } else {
    $('#chats').prepend('<div class=chat>' + username + ': ' + message.text + '</div>');
  }
};

/*********************************************************************************/

/********************************* FILTERING ROOMS ********************************/
app.addRoom = function(message) {
  if (typeof message === 'string') {
    message = { roomname: message};
  }
  if (message.roomname) {
    message.roomname = message.roomname.toLowerCase();
    if (!this.currentRooms[message.roomname]) {
      this.currentRooms[message.roomname] = message.roomname;
      $('#roomSelect').append('<option value=' + message.roomname + ' class=room>' + message.roomname + '</option>');
    }
  }
};

app.filterRooms = function(newRoom) {
  this.clearMessages();
  var filteredMessages = this.currentMessages.filter(function(elem) {
    return elem.roomname === newRoom;
  });

  this.populateChat(filteredMessages);
};

/*******************************************************************************/

/******************************* FRIENDS LIST **********************************/

app.addFriend = function(newFriend) {
  this.friendsList[newFriend] = newFriend;
};

$(document).on('click', '.username', function(event) {
  var newFriend = $(this).text();
  app.addFriend(newFriend);
  // console.log($('.username'));
  $('span:contains("' + newFriend + '")').parent().toggleClass('friend');
  event.preventDefault();
});

/********************************************************************************/

app.handleSubmit = function(message) {
  var user = window.location.search.slice(10);
  var room = $('#roomSelect').val();
  var obj = {
    username: user,
    text: message,
    roomname: room
  };
  this.send(obj);
  // this.addMessage(obj);
};

$(document).on('submit', '#send', function( event ) {
  var message = $('input').val();
  if ( message !== '') {
    app.handleSubmit(message);
    $('.textbox').val('');
  }
  setTimeout(function() { app.fetch(); }, 50);
  event.preventDefault();
});

// setInterval(function() {
//   console.log('fetching!');
//   console.log(app.fetch());
// }, 3000);

$(document).on('click', '#update', function(event) {
  app.fetch();
  // console.log('testing', app.currentMessages);
});

$(document).on('change', '#roomSelect', function(event) {
  var newRoom = $('#roomSelect').val();
  if (newRoom === 'addRoom') {
    var newestRoom = prompt('What is the name of this new room?');
    app.addRoom(newestRoom);
    newRoom = newestRoom;
    $('#roomSelect').val(newestRoom.toLowerCase());
    console.log('test', app.currentMessages);
  }
  app.presentRoom = newRoom;
  app.filterRooms(newRoom);
});


