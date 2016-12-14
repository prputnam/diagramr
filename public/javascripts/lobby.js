var
socket = io(),
messages = [],
diagramId = -1;


//rivets.bind($('#message-panel'), { messages: messages });

/*

$(document).ready(function() {
    $("#messageSend").class(function() {
        console.log($("#messageText").val());
    });
});
//socket.emit('message', {name: userId, message})

*/

$(document).ready(function() {

    $("#messageSend").click(function() {
        var content = $("#messageText").val();
        socket.emit('message', { userId: userId, name: username, content: content, diagramId: diagramId });
        $("#messageText").val('');
    });

});

socket.on('message', function(message) {
    addMessageToScreen(message);
});

socket.on('connect', function() {
    // join the correct chat room
    socket.emit('join', { diagramId: diagramId, userId: userId, username: username });
});

socket.on('clients', function(clients) {
    var userList = $('#user-list');

    userList.empty();

    clients.forEach(function(client) {
        userList.append('<li>' + client.username + '</li>');
    });
    console.log(clients);
});

addMessageToScreen = function(message) {
    var
    messagePanel = $("#message-panel"),
    newElement = buildMessageElement(message);

    messagePanel.append(newElement);
};

buildMessageElement = function(message) {
    var newElement =  `
        <div class="row message-bubble">
            <p class="text-muted">` + message.name + `</p>
            <p>` + message.content + `</p>
        </div>`;

    return newElement;
}


console.log(userId);
console.log(diagrams);