var
socket = io(),
canvas = new fabric.CanvasEx('c'),
grid = 10,
numberOfFields = 0,
diagramLockedByCurrentUser = false,
diagramLockedByAnotherUser = false,
writeToDBTimer = null,
writeToDBInactivityInterval = 200;

// initial setup
function init() {

    // if there is a lock, determine who set it
    // current user, or someone else
    if(diagram.lockedById) {
        if( diagram.lockedById != user.userId) {
            diagramLockedByAnotherUser = true;
        } else if(diagram.lockedById == user.userId) {
            diagramLockedByCurrentUser = true;
        }
    }

    // if there is an existing diagram, draw it
    // otherwise, draw the grid
    if(diagram.diagram && diagram.diagram.length > 0) {
        updateCanvasFromJSON(diagram.diagram);
    } else {
        for (var i = 0; i < (1000 / grid + 1); i++) {
            canvas.add(new fabric.Line([ i * grid, 0, i * grid, 1000], { static: true, hoverCursor: 'default', stroke: '#ccc', selectable: false }));
            canvas.add(new fabric.Line([ 0, i * grid, 1000, i * grid], { static: true, hoverCursor: 'default', stroke: '#ccc', selectable: false }));
        }
    }

    // take appropriate actions based on the lock status
    // this must come after the loading so that the "frozen" state
    // will be created
    if(diagramLockedByAnotherUser) {
        setDiagramToLockedState();
    } else if(diagramLockedByCurrentUser) {
        lockDiagram();
    }
}

// used to set the locked state when a different user has
// locked the diagram
function setDiagramToLockedState() {
    diagramLockedByAnotherUser = true;

    canvas.forEachObject(function(object){
        object.selectable = false;
    });

    $('#entity-btn').prop('disabled', true);
    $('#lock-btn').prop('disabled', true);

    if(!$("#locked-alert").length) {
        $('.menu').append('<div id="locked-alert" class="alert alert-danger" role="alert">The diagram is locked by another user.</div>');
    }
}

// used to set the lock state when a different user
// has unlocked the diagram
function setDiagramToUnlockedState() {
    diagramLockedByAnotherUser = false;

    canvas.forEachObject(function(object){
        if(!object.static) {
            object.selectable = true;
        }
    });

    $('#entity-btn').prop('disabled', false);
    $('#lock-btn').prop('disabled', false);
    $('#locked-alert').remove();
}

// used to lock the diagram when the current user
// sets the lock
function lockDiagram() {
    diagramLockedByCurrentUser = true;

    $.post('/diagram/' + diagram.diagramId + '/lock', { lockedById: diagram.lockedById });
    socket.emit('diagramLocked', { diagramId: diagram.diagramId });

    $('.menu').append('<div id="locked-message" class="alert alert-info" role="alert">You have locked the diagram. Click here to unlock.</div>');
    $('#lock-btn').prop('disabled', true);

    $('#locked-message').click(function() {
        unlockDiagram();
    })
}

// used to unlock the diagram when the currnet user
// set the lock
function unlockDiagram() {
    diagramLockedByCurrentUser = false;

    $.post('/diagram/' + diagram.diagramId + '/lock', { lockedById: null });
    socket.emit('diagramUnlocked', { diagramId: diagram.diagramId });

    $('#locked-message').remove();
    $('#lock-btn').prop('disabled', false);
}

// used to generate the text displayed in the
// entitiy models
function prettyPrintFields(fields) {
    var fieldsString = '';

    fields.forEach(function(field) {
        fieldsString += field.name;
        fieldsString += ':' + field.datatype.toUpperCase();

        if(field.size)
            fieldsString += '(' + field.size + ')';

        fieldsString += "\n"
    });

    fieldsString = fieldsString.slice(0, -1);

    return fieldsString;
}

// used to build the group of objects that makes up
// the entity on the canvas
function buildEntity(entityName, fields) {
    var
    defaultTop = 100,
    defaultLeft = 100,
    fieldsString = prettyPrintFields(fields);

    // first build the entity name
    var nameText = new fabric.Text(entityName, {
        top: defaultTop + 5,
        left: defaultLeft + 5,
        fontFamily: 'sans-serif',
        fontSize: 16
    });

    // and set the header height based upon it
    var
    headerHeight = Math.ceil(nameText.getBoundingRectHeight()) + 10;

    // next buld the fields text
    var fieldText = new fabric.Text(fieldsString, {
        top: defaultTop + headerHeight + 5,
        left: defaultLeft + 5,
        fontFamily: 'sans-serif',
        fontSize: 12
    });

    // and determine the entity height and width
    var
    bodyHeight = Math.ceil(fieldText.getBoundingRectHeight()) + 10,
    width = Math.ceil(Math.max(fieldText.getBoundingRectWidth(), nameText.getBoundingRectWidth()) + 10);

    // build the header and the body
    var header = new fabric.Rect({
        top: defaultTop,
        left: defaultLeft,
        height: headerHeight,
        width: width,
        stroke: '#000',
        strokeWidth: 2,
        fill: '#CCC'
    });

    var body = new fabric.Rect({
        top: defaultTop + headerHeight,
        left: defaultLeft,
        height: bodyHeight,
        width: width,
        stroke: '#000',
        strokeWidth: 2,
        fill: '#FFF'
    });

    // group all the objects and prevent them from being modified
    var entity = new fabric.Group([header, nameText, body, fieldText], {
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false
    });

    // add the entity to the center of the canvas
    canvas.add(entity);
    entity.center();
    entity.setCoords();

    // push the change to other clients and the database
    pushDiagram();
}

// set up the handler
$(document).ready(function() {
    init();

    // reset modal
    $('#entity-modal').on('hidden.bs.modal', function() {
        numberOfFields = 0;
        $('#entity-name').val('');
        $('#new-entity-').empty();
    });

    // add field to the entity modal
    $('#additional-field').click(function() {
        addFieldToForm(numberOfFields);
    });

    // handle submission of the entity modal
    $('#create-entity').click(function() {
        var form = $('#new-entity-form')[0];

        // if it passes the HMTL5 validation..
        if(!form.checkValidity || form.checkValidity()) {

            // get the entity name
            var
            entityName = $('#entity-name').val(),
            fields = [];

            // and build an array representing the fields
            for(var i = 0; i < numberOfFields; i++) {

                var field = {
                    name: $('#field-name-' + i).val(),
                    datatype: $('#datatype-' + i + ' option:selected').text(),
                    size: $('#size-' + i).val()
                }

                // if no explicit size set, make it null
                field.size = field.size.length > 0 ? field.size : null;
                fields.push(field);
            }

            // hand off the name and fields to the buildEntity method,
            // clean up after modal
            buildEntity(entityName, fields);
            $('#entity-modal').modal('toggle');
            $('#entity-name').val('');
        }
    });

    // lock the diagram
    $('#lock-btn').click(function() {
        diagram.lockedById = user.userId;
        lockDiagram();
    });

    // gather the data for the share modal
    $('#share-btn').click(function() {
        $.getJSON('/users', function(data) {

            // display all the users that aren't the current user
            data.forEach(function(u) {
                if(u.userId != user.userId) {
                    $('#share-select').append(`<option>${u.username}</option>`);
                }

                $('#share-select').selectpicker('refresh');
            });
        });
    });

    // submit the share modal
    $('#share-submit').click(function() {
        var usernames = JSON.stringify($('#share-select').val());
        $.post('/diagram/' + diagram.diagramId + '/addUsers', { usernames: usernames });
    });

    // send chat message
    $("#messageSend").click(function() {
        var content = $("#messageText").val();
        socket.emit('message', { userId: user.userId, name: user.username, content: content, diagramId: diagram.diagramId });
        $("#messageText").val('');
    });

    // delete item when it is double clicked
    canvas.on('mouse:dblclick', function(options) {
        // if the diagram isn't locked
        if(!diagramLockedByAnotherUser) {

            // and the target exists and it isn't marked as static, remove it
            if(options.target && !options.target.static) {
                canvas.remove(options.target);
                pushDiagram();
            }
        }
    });

    // on object move, start a timer to push the state change with
    canvas.on('object:moving', function() {
        if(!diagramLockedByAnotherUser) {
            clearTimeout(writeToDBTimer);
            writeToDBTimer = setTimeout(pushDiagram, writeToDBInactivityInterval);
        } else {
            clearTimeout(writeToDBTimer);
        }
    });

});

// serializes and then sends the canvas to other clients via
// socket.io and to the database
function pushDiagram() {
    var diagramString = JSON.stringify(canvas.toJSON(['hoverCursor', 'selectable', 'lockScalingX', 'lockScalingY', 'hasControls', 'static']));

    $.post("/diagram/" + diagram.diagramId, { diagram: diagramString });
    socket.emit('diagramUpdate', { diagramId: diagram.diagramId, diagram: diagramString });
}

// update the canvas with stringified JSON data
function updateCanvasFromJSON(diagramString) {
    canvas.clear();
    canvas.loadFromJSON(diagramString);
    canvas.renderAll();

    if(diagramLockedByAnotherUser) {
        setDiagramToLockedState();
    }
}

// used to add another field to the entity creation modal
function addFieldToForm(fieldNumber) {
    // this is super ugly here, but damn the templating is slick
    var fieldTemplate =
    `<div id="field-${fieldNumber}"
        <div class="form-group">
            <label for="field-name-${fieldNumber}" class="col-sm-2 control-label">Name</label>
            <div class="col-sm-10">
                <input type="text" id="field-name-${fieldNumber}" class="form-control" name="field-name-${fieldNumber}" placeholder="Field Name" required>
            </div>
        </div>
        <div class="form-group">
            <label for="datatype-${fieldNumber}" class="col-sm-2 control-label">Datatype</label>
            <div class="col-sm-6">
                <select id="datatype-${fieldNumber}" class="selectpicker" name="datatype-${fieldNumber}" title="Pick a datatype" data-live-search="true" required>
                    <option data-sizable="false">bigint</option>
                    <option data-sizable="false">bigserial</option>
                    <option data-sizable="true">bit</option>
                    <option data-sizable="true">bit varying</option>
                    <option data-sizable="false">boolean</option>
                    <option data-sizable="false">box</option>
                    <option data-sizable="false">bytea</option>
                    <option data-sizable="true">char</option>
                    <option data-sizable="true">varchar</option>
                    <option data-sizable="false">cidr</option>
                    <option data-sizable="false">circle</option>
                    <option data-sizable="false">date</option>
                    <option data-sizable="false">double</option>
                    <option data-sizable="false">inet</option>
                    <option data-sizable="false">integer</option>
                    <option data-sizable="false">interval</option>
                    <option data-sizable="false">json</option>
                    <option data-sizable="false">jsonb</option>
                    <option data-sizable="false">line</option>
                    <option data-sizable="false">lseg</option>
                    <option data-sizable="false">macaddr</option>
                    <option data-sizable="false">money</option>
                    <option data-sizable="false">numeric</option>
                    <option data-sizable="false">path</option>
                    <option data-sizable="false">point</option>
                    <option data-sizable="false">polygon</option>
                    <option data-sizable="false">real</option>
                    <option data-sizable="false">smallint</option>
                    <option data-sizable="false">smallserial</option>
                    <option data-sizable="false">serial</option>
                    <option data-sizable="false">text</option>
                    <option data-sizable="false">time</option>
                    <option data-sizable="false">timestamp</option>
                    <option data-sizable="false">uuid</option>
                    <option data-sizable="false">xml</option>
                </select>
            </div>
            <div class="checkbox col-sm-2">
                <label>
                    <input id="set-size-${fieldNumber}" type="checkbox" disabled> Set size
                </label>
            </div>
            <div class="col-sm-2">
                <input id="size-${fieldNumber}" type="number" min="0" step="1" class="form-control" name="size" placeholder="Size" disabled>
            </div>
        </div>
    </div>
    <hr>`;

    // append the template to the appropriate spot
    $('#field-wrapper').append(fieldTemplate);
    $('#datatype-' + fieldNumber).selectpicker();

    // set the handler
    $('#datatype-' + fieldNumber).change(function() {
        var
        selected = $('#datatype-' + fieldNumber + ' option:selected'),
        sizable = selected.data('sizable');

        if(sizable) {
            $('#set-size-' + fieldNumber).prop('disabled', false);
        } else {
            $('#set-size-' + fieldNumber).prop('disabled', true);
            $('#set-size-' + fieldNumber).removeAttr('checked');

            $('#size-' + fieldNumber).prop('disabled', true);
            $('#size-' + fieldNumber).prop('required', false);
            $('#size-' + fieldNumber).val('');
        }
    });

    $('#set-size-' + fieldNumber).click(function() {

        if($('#set-size-' + fieldNumber).is(':checked')) {
            $('#size-' + fieldNumber).prop('disabled', false);
            $('#size-' + fieldNumber).prop('required', true);
        } else {
            $('#size-' + fieldNumber).prop('disabled', true);
            $('#size-' + fieldNumber).prop('required', false);
            $('#size-' + fieldNumber).val('');
        }
    });

    // and lastly, incrememnt the field count
    numberOfFields++;
}

// used to add a chat message to the chat pane
function addMessageToScreen(message) {
    var
    messagePanel = $("#message-panel"),
    newElement = buildMessageElement(message);

    messagePanel.append(newElement);
};

// helper function for displaying chat messages
function buildMessageElement(message) {
    var newElement =  `
        <div class="row message-bubble">
            <p class="text-muted">` + message.name + `</p>
            <p>` + message.content + `</p>
        </div>`;

    return newElement;
}

// socket.io land

// when we connect, tell the server what room to place us in
socket.on('connect', function() {
    // join the correct chat room
    socket.emit('join', { diagramId: diagram.diagramId, userId: user.userId, username: user.username });
});

// when we get clients, update the current list of users
socket.on('clients', function(clients) {
    var userList = $('#user-list');

    userList.empty();

    clients.forEach(function(client) {
        userList.append('<li>' + client.username + '</li>');
    });
});

// add incoming chat messages to the screen
socket.on('message', function(message) {
    addMessageToScreen(message);
});

// handle locking and unlocking the diagram
socket.on('diagramUnlocked', function() {
    setDiagramToUnlockedState();
});

socket.on('diagramLocked', function() {
    setDiagramToLockedState();
})

// update the canvas with new data
socket.on('diagramUpdate', function(diagramString) {
    updateCanvasFromJSON(diagramString);
});