var
canvas = new fabric.CanvasEx('c'),
grid = 10,
started = false,
x = 0,
y = 0,
entities = [];

//canvas.selection = false;

for (var i = 0; i < (1000 / grid + 1); i++) {
    canvas.add(new fabric.Line([ i * grid, 0, i * grid, 1000], { static: true, hoverCursor: 'default', stroke: '#ccc', selectable: false }));
    canvas.add(new fabric.Line([ 0, i * grid, 1000, i * grid], { static: true, hoverCursor: 'default', stroke: '#ccc', selectable: false }));
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