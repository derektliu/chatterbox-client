var app = {
  server: 'https://api.parse.com/1/classes/messages',
  friendsList: {},
  currentMessages: [],
  presentRoom: 'lobby',
  currentRooms: {lobby: 'lobby'}
};

app.init = function () {

  // JQuery Selectors
  app.$main = $('#main');
  app.$chats = $('#chats');
  app.$textbox = $('.textbox');
  app.$roomSelect = $('#roomSelect');

  // add listeners
  app.$main.on('click', '#update', app.handleUpdateButton);
  app.$main.on('submit', '#send', app.handleSubmitButton);
  app.$main.on('change', '#roomSelect', app.handleRoomSelect);
  app.$chats.on('click', '.username', app.handleUsername);

  app.fetch();

  // setInterval(function() { app.fetch(); }, 5000);
};

/*************************** SERVER FUNCTIONS ********************************/
app.send = function(message) {
  $.ajax({
    url: app.server,
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

app.fetch = function () {
  $.ajax({
    url: app.server,
    type: 'GET',
    data: 'order=-createdAt',
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

app.grabServerMessages = function (serverMessages) {
  //add new server message to local cache
  app.currentMessages = serverMessages;

  // add any new rooms
  app.currentMessages.forEach(app.addRoom);

  // populate chats area
  app.populateChat(app.currentMessages);
};

app.handleUpdateButton = function(event) {
  // update chats when update button is clicked
  app.fetch();
  event.preventDefault();
};

app.handleSubmitButton = function(event) {
  // when the submit button is pressed,
  // grab input from user and send to server
  var message = app.$textbox.val();
  if ( message !== '') {
    app.handleSubmit(message);
    app.$textbox.val('');
  }

  // after 100ms, refresh chats with new user message
  setTimeout(function() { app.fetch(); }, 100);

  event.preventDefault();
};

app.handleSubmit = function(message) {
  // method accepts a 'string' as parameter for message

  // create object with elements
  // take username from DOM during initial prompt
  // take roomname from the current selected room
  var username = window.location.search.slice(10);
  var roomname = app.presentRoom;

  // create message object to send to server
  var messageObj = {
    username: username,
    text: message,
    roomname: roomname
  };

  // finally, send the message object to the server
  app.send(messageObj);

};
/*****************************************************************************/

/**************************CHAT BOX*****************************************/


app.populateChat = function(allMessages) {
  app.clearMessages();
  // allMessages is Array of message Objects
  // loop through allMessages to...
  for (var i = allMessages.length - 1; i >= 0; i--) {
    // 1) append messages to DOM 
    if (allMessages[i].roomname === app.presentRoom) {
      app.addChatMessage(allMessages[i]);
    }
  }
};

app.clearMessages = function() {
  // Clear all Chats on screen
  app.$chats.empty();
};

app.addChatMessage = function(message) {
  // function is passed a message Object

  // append username + text to chat box
  var $chat = $('<div class="chat" />');

  // grab username and text from message Object (and escape all user input!! **Security**)
  message.username = _.escape(message.username);
  var username = $('<span class="username" />')
    .text(message.username)
    .appendTo($chat);

  // truncate message if longer than 140 characters
  message.text = _.escape(message.text);
  if (message.text.length > 140) { message.text = message.text.slice(0, 140) + '...'; }

  var text = $('<br><span/>')
    .text(message.text)
    .appendTo($chat);

  // If the username of message is in the current FriendsList, add 'friend' class to div
  if (app.friendsList[message.username]) {
    $chat.addClass('friend');
  }

  app.$chats.prepend($chat);

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
    if (!app.currentRooms[message.roomname]) {
      app.currentRooms[message.roomname] = message.roomname;

      var $room = $('<option/>')
        .val(message.roomname)
        .text(message.roomname)
        .addClass('room');

      app.$roomSelect.append($room);
    }
  }
};

app.filterRooms = function(newRoom) {
  // method accepts 'string' for newRoom parameter

  // if newRoom filter is not lobby, display only messages in that room
  if (newRoom !== 'lobby') {
    var filteredMessages = app.currentMessages.filter(function(element) {
      return element.roomname === newRoom;
    });
  } else {
    // if newRoom filter IS lobby, display lobby messages and also rooms with no Room Name
    var filteredMessages = app.currentMessages.filter(function(element) {
      return element.roomname === newRoom || element.roomname === undefined;
    });
  }

  // repopulate chat with new filtered messages
  app.populateChat(filteredMessages);
};

app.handleRoomSelect = function (event) {
  // grab room name from roomselector
  var newRoom = app.$roomSelect.val();

  // if user wants to add a room, create prompt and create new Room from userInput
  if (newRoom === 'addRoom') {
    newRoom = prompt('What is the name of this new room?').toLowerCase();
    app.addRoom(newRoom);
    app.$roomSelect.val(newRoom);
  }

  // once new room is selected, change the present viewing room to new Room and filter chats
  app.presentRoom = newRoom;
  app.filterRooms(newRoom);
};

/*******************************************************************************/

/******************************* FRIENDS LIST **********************************/

app.addFriend = function(newFriend) {
  // add newFriend to the FriendsList object and replace duplicates
  app.friendsList[newFriend] = newFriend;
};

app.handleUsername = function(event) {
  var newFriend = $(this).text();
  newFriend = _.escape(newFriend);

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
};

/********************************************************************************/

app.init();



