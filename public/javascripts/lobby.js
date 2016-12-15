var
socket = io(),
messages = [],
diagramId = -1;

$(document).ready(function() {
    // send messages
    $("#messageSend").click(function() {
        var content = $("#messageText").val();
        socket.emit('message', { userId: userId, name: username, content: content, diagramId: diagramId });
        $("#messageText").val('');
    });

});

// on receipt of new messages
socket.on('message', function(message) {
    addMessageToScreen(message);
});

// on connection..
socket.on('connect', function() {
    // join the correct chat room
    socket.emit('join', { diagramId: diagramId, userId: userId, username: username });
});

// handle client list updating
socket.on('clients', function(clients) {
    var userList = $('#user-list');

    userList.empty();

    clients.forEach(function(client) {
        userList.append('<li>' + client.username + '</li>');
    });
});

// add new chat message to the screen
addMessageToScreen = function(message) {
    var
    messagePanel = $("#message-panel"),
    newElement = buildMessageElement(message);

    messagePanel.append(newElement);
};

// helper to add a message to the screen
buildMessageElement = function(message) {
    var newElement =  `
        <div class="row message-bubble">
            <p class="text-muted">` + message.name + `</p>
            <p>` + message.content + `</p>
        </div>`;

    return newElement;
}