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
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function (roomFilter) {

  roomFilter = (roomFilter === undefined || roomFilter === 'lobby') ? '' : 'where={"roomname": "' + roomFilter + '" }';

  $.ajax({
    url: this.server,
    type: 'GET',
    data: roomFilter + '&order=-createdAt',
    contentType: 'application/json',
    success: function (data) {
      app.grabServerMessages(data.results);
      console.log('chatterbox: Message retrieved!');
    },
    error: function (data) {
      console.error('chatterbox: Failed to retrieve new messages', data);
    }
  });

};

$(document).on('click', '#update', function(event) {
  // update chats when update button is clicked
  app.fetch(app.presentRoom);
});

$(document).on('submit', '#send', function( event ) {

  // when the submit button is pressed,
  // grab input from user and send to server
  var message = $('input').val();
  if ( message !== '') {
    app.handleSubmit(message);
    $('.textbox').val('');
  }

  // after 100ms, refresh chats with new user message
  setTimeout(function() { app.fetch(app.presentRoom); }, 100);

  event.preventDefault();
});

app.handleSubmit = function(message) {
  // method accepts a 'string' as parameter for message

  // create object with elements
  // take username from DOM during initial prompt
  // take roomname from the current selected room
  var username = window.location.search.slice(10);
  // var roomname = $('#roomSelect').val();
  var roomname = this.presentRoom;
  console.log('presentRoom', this.presentRoom);
  var obj = {
    username: username,
    text: message,
    roomname: roomname
  };

  // finally, send the message object to the server
  this.send(obj);

};
/*****************************************************************************/

/**************************CHAT BOX*****************************************/
app.grabServerMessages = function (serverMessages) {

  this.clearMessages();
  this.currentMessages = serverMessages;
  this.populateChat(this.currentMessages);
  // filter rooms when grabbing from server (default: lobby)
  //this.filterRooms(this.presentRoom);
};

app.populateChat = function(allMessages) {

  // allMessages is Array of message Objects
  // loop through allMessages to...
  for (var i = allMessages.length - 1; i >= 0; i--) {
    // 1) append messages to DOM 
    this.addMessage(allMessages[i]);
    // 2) add Room Names to room selector in DOM
    this.addRoom(allMessages[i]);
  }

};

app.clearMessages = function() {

  // Clear all Chats on screen
  $('#chats').empty();

};

app.addMessage = function(message) {

  // function is passed a message Object
  // grab username and text from message Object (and escape all user input!! **Security**)
  var username = '<span class=username>' + _.escape(message.username) + '</span>';

  var text = _.escape(message.text);
  if (text.length > 140) {
    text = text.slice(0, 140) + '...';
  }

  // If the username of message is in the current FriendsList, add 'friend' class to div
  if (this.friendsList[message.username]) {
    $('#chats').prepend('<div class="chat friend">' + username + ': ' + text + '</div>');
  } else {
    // otherwise append as normal 'chat' class
    $('#chats').prepend('<div class=chat>' + username + ': ' + text + '</div>');
  }

};
/*********************************************************************************/

/********************************* FILTERING ROOMS ********************************/
app.addRoom = function(message) {
  // addRoom function can accept 'strings' and 'objects' as parameters

  // if parameter is passed as 'string', convert to object (and escape!!)
  if (typeof message === 'string') {
    message = { roomname: message };
  }

  if (message.roomname) {
    message.roomname = _.escape(message.roomname.toLowerCase().slice(0, 20));

    // add to DOM if the roomname does not already exist on the roomSelector
    if (!this.currentRooms[message.roomname]) {
      this.currentRooms[message.roomname] = message.roomname;
      $('#roomSelect').append('<option value=' + message.roomname + ' class=room>' + message.roomname + '</option>');
    }
  }
};

app.filterRooms = function(newRoom) {
  // method accepts 'string' for newRoom parameter

  this.fetch(newRoom);

  // this.clearMessages();

  // // if newRoom filter is not lobby, display only messages in that room
  // if (newRoom !== 'lobby') {
  //   var filteredMessages = this.currentMessages.filter(function(elem) {
  //     return elem.roomname === newRoom;
  //   });
  // } else {

  //   // if newRoom filter IS lobby, display lobby messages and also rooms with no Room Name
  //   var filteredMessages = this.currentMessages.filter(function(elem) {
  //     return elem.roomname === newRoom || elem.roomname === undefined;
  //   });
  // }

  // // repopulate chat with new filtered messages
  // this.populateChat(filteredMessages);
};

$(document).on('change', '#roomSelect', function(event) {
  // grab room name from roomselector
  var newRoom = $('#roomSelect').val();

  // if user wants to add a room, create prompt and create new Room from userInput
  if (newRoom === 'addRoom') {
    newRoom = prompt('What is the name of this new room?').toLowerCase();
    app.addRoom(newRoom);
    $('#roomSelect').val(newRoom);
  }

  // once new room is selected, change the present viewing room to new Room and filter chats
  app.presentRoom = newRoom;
  app.filterRooms(newRoom);
});

/*******************************************************************************/

/******************************* FRIENDS LIST **********************************/

app.addFriend = function(newFriend) {
  // add newFriend to the FriendsList object and replace duplicates
  this.friendsList[newFriend] = newFriend;
};

$(document).on('click', '.username', function(event) {

  var newFriend = $(this).text();

  // if newFriend is not in our friendsList
  if (!app.friendsList[newFriend]) {

    // add friend to ourFriends Object
    // and add 'friend' class for divs in DOM
    app.addFriend(newFriend);
    $('span:contains("' + newFriend + '")').parent().addClass('friend');

  } else {

    // otherwise, delete friend from friendsList
    // and toggle class off for divs in DOM 
    delete app.friendsList[newFriend];
    $('span:contains("' + newFriend + '")').parent().removeClass('friend');

  }

  event.preventDefault();
});

/********************************************************************************/

app.fetch();

// setInterval(function() {
//   console.log('fetching!');
//   console.log(app.fetch());
// }, 3000);
