var
socket = io(),
canvas = new fabric.CanvasEx('c'),
grid = 10,
started = false,
x = 0,
y = 0,
numberOfFields = 0,
entities = [],
writeToDBTimer = null,
writeToDBInactivityInterval = 1000;

//canvas.selection = false;

for (var i = 0; i < (1000 / grid + 1); i++) {
    canvas.add(new fabric.Line([ i * grid, 0, i * grid, 1000], { static: true, hoverCursor: 'default', stroke: '#ccc', selectable: false }));
    canvas.add(new fabric.Line([ 0, i * grid, 1000, i * grid], { static: true, hoverCursor: 'default', stroke: '#ccc', selectable: false }));
}

function buildEntityModal() {
    var form = $('form');

    // set title and clear existing content
    $('.modal-title').text('Entity');
    form.empty();

    form.append('<div class="form-group">')
        .append('<label for="name" class="col-sm-2 control-label">Name</label>')
        .append('<div class="col-sm-10">')
        .append('<input type="text" class="form-control" name="text" placeholder="Text">');

}

function buildEntity(top, left, text) {
    var name = new fabric.Text(text, {
        top: top + 5,
        left: left + 5,
        fontFamily: 'sans-serif',
        fontSize: 16
    });

    var
    height = Math.ceil(name.getBoundingRectHeight()) + 10,
    width = Math. ceil(name.getBoundingRectWidth()) + 10;

    var header = new fabric.Rect({
        top: top,
        left: left,
        height: height,
        width: width,
        stroke: '#000',
        strokeWidth: 2,
        fill: '#CCC'
    });

    var rect = new fabric.Rect({
        top: top,
        left: left,
        height: height + 20,
        width: width,
        stroke: '#000',
        strokeWidth: 2,
        fill: '#FFF'
    });

    var entity = new fabric.Group([rect, header, name], {
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false
    });

    entities.push(entity);

    canvas.add(entity);
}

$(document).ready(function() {

    // reset field count when modal is openned
    $('.modal').on('hidden.bs.modal', function() {
        numberOfFields = 0;
        $('#field-wrapper').empty();
    });

    $('#additional-field').click(function() {
        console.log(numberOfFields)
        numberOfFields++;
        addFieldToForm(numberOfFields);
    });

    $('#create-rectangle').click(function() {
        var text = $('input[name="text"]').val();
        buildEntity(100, 100, text);
        $('.modal').modal('toggle');
        $('form')[0].reset();
        console.log('rectangle built')
    });

    canvas.on('mouse:dblclick', function(options) {

        console.log(options);
        if(options.target && !options.target.static) {
            canvas.remove(options.target);
            console.log(entities);
            entities = removeObjectFromArray(entities, options.target);
            console.log(entities);
        }

    });

});

function pushDiagram() {
    var diagramString = JSON.stringify(canvas.toJSON(['hoverCursor', 'selectable', 'lockScalingX', 'lockScalingY', 'hasControls', 'static']));

    saveToDatabase(diagramString);
    sendToOtherClients(diagramString);
}

function sendToOtherClients(diagramString) {
    socket.emit('diagramUpdate', { diagramId: diagram.diagramId, diagram: diagramString });
}

function saveToDatabase(diagramString) {
    $.post("/diagram/" + diagram.diagramId, { diagram: diagramString });
}

function updateCanvasFromJSON(diagramString) {
    canvas.clear();
    canvas.loadFromJSON(diagramString);
    canvas.renderAll();

    if(diagram.lockedById && diagram.lockedById != user.userId) {
        diagramLocked();
    }
}
function addFieldToForm(fieldNumber) {
    var fieldTemplate =
    `<div class="form-group">
        <label for="field-name-${fieldNumber}" class="col-sm-2 control-label">Name</label>
        <div class="col-sm-10">
            <input type="text" id="field-name-${fieldNumber}" class="form-control" name="field-name-${fieldNumber}" placeholder="Field Name">
        </div>
    </div>
    <div class="form-group">
        <label for="datatype-${fieldNumber}" class="col-sm-2 control-label">Datatype</label>
        <div class="col-sm-6">
            <select id="datatype-${fieldNumber}" class="selectpicker" name="datatype-${fieldNumber}" title="Pick a datatype" data-live-search="true">
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
    <hr>`;

    $('#field-wrapper').append(fieldTemplate);
    $('#datatype-' + fieldNumber).selectpicker();

    $('#datatype-' + fieldNumber).change(function() {
        var
        selected = $('#datatype-' + fieldNumber + ' option:selected'),
        sizable = selected.data('sizable');
        console.log(sizable)

        if(sizable) {
            console.log('sizable')
            $('#set-size-' + fieldNumber).prop('disabled', false);
        } else {
            console.log('not')
            $('#set-size-' + fieldNumber).prop('disabled', true);
            $('#set-size-' + fieldNumber).removeAttr('checked');

            $('#size-' + fieldNumber).prop('disabled', true);
            $('#size-' + fieldNumber).val('');
        }
    })

    $('#set-size-' + fieldNumber).click(function() {
        console.log

        if($('#set-size-' + fieldNumber).is(':checked')) {
            $('#size-' + fieldNumber).prop('disabled', false);
        } else {
            $('#size-' + fieldNumber).prop('disabled', true);
            $('#size-' + fieldNumber).val('');
        }
    });

}

function removeObjectFromArray(array, object) {
    var
    output,
    index = array.indexOf(object);

    if(index > -1 ) {
        output = array.splice(index, 1);
    } else {
        output = array;
    }

    return output;
}

socket.on('connect', function() {
    // join the correct chat room
    console.log(diagram)
    socket.emit('join', { diagramId: diagram.diagramId, userId: user.userId, username: user.username });
});

socket.on('clients', function(clients) {
    var userList = $('#user-list');

    userList.empty();

    clients.forEach(function(client) {
        userList.append('<li>' + client.username + '</li>');
    });
    console.log(clients);
});

socket.on('diagramUpdate', function(diagramString) {
    updateCanvasFromJSON(diagramString);
});
// canvas.on('mouse:down', function(options) {
//     if(canvas.getActiveObject()){
//         return false;
//     }

//     console.log(options);

//     started = true;
//     x = options.e.layerX;
//     y = options.e.layerY;

//     var square = new fabric.Rect({
//       width: 0,
//       height: 0,
//       left: x,
//       top: y,
//       fill: '#000'
//     });

//     canvas.add(square);
//     canvas.setActiveObject(square);
// });

// canvas.on('mouse:move', function(options) {
//     if(!started) {
//         return false;
//     }

//     var
//     dropX = options.e.layerX,
//     dropY = options.e.layerY,
//     w = Math.abs(dropX - x),
//     h = Math.abs(dropY - y);

//     if (!w || !h) {
//         return false;
//     }

//     var square = canvas.getActiveObject();

//     if(dropX > x) {
//         square.set('width', w);
//     } else {
//         square.set('left', dropX);
//         square.set('width', w);
//     }

//     if(dropY > y) {
//         square.set('height', h);
//     } else {
//         square.set('top', dropY);
//         square.set('height', h);
//     }
//     square.set('width', w).set('height', h);
// });

// canvas.on('mouse:up', function(options) {
//     if(started) {
//       started = false;
//     }

//     var square = canvas.getActiveObject();

//     canvas.add(square);


//     $.post("/diagram/" + diagram.diagramId, { diagram: JSON.stringify(canvas.toJSON()) });
// });

// canvas.on('object:modified', function() {
//     console.log('object:modified');
// })

// canvas.on('after:render', function() {
//     console.log('after:render')
// })