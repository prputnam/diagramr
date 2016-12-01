var
socket = io(),
messages = [];


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
        socket.emit('message', {name: userId, content: content});
    });
});

socket.on('message', function(message) {
    addMessageToScreen(message);
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