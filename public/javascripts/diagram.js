var
canvas = new fabric.Canvas('c'),
grid = 10,
started = false,
x = 0,
y = 0;


for (var i = 0; i < (1000 / grid + 1); i++) {
    canvas.add(new fabric.Line([ i * grid, 0, i * grid, 1000], { stroke: '#ccc', selectable: false }));
    canvas.add(new fabric.Line([ 0, i * grid, 1000, i * grid], { stroke: '#ccc', selectable: false }));
}

canvas.on('mouse:down', function(options) {
    if(canvas.getActiveObject()){
        return false;
    }

    console.log(options);

    started = true;
    x = options.e.layerX;
    y = options.e.layerY;

    var square = new fabric.Rect({
      width: 0,
      height: 0,
      left: x,
      top: y,
      fill: '#000'
    });

    canvas.add(square);
    canvas.setActiveObject(square);
});

canvas.on('mouse:move', function(options) {
    if(!started) {
        return false;
    }

    var
    dropX = options.e.layerX,
    dropY = options.e.layerY,
    w = Math.abs(dropX - x),
    h = Math.abs(dropY - y);

    if (!w || !h) {
        return false;
    }

    var square = canvas.getActiveObject();

    if(dropX > x) {
        square.set('width', w);
    } else {
        square.set('left', dropX);
        square.set('width', w);
    }

    if(dropY > y) {
        square.set('height', h);
    } else {
        square.set('top', dropY);
        square.set('height', h);
    }
    square.set('width', w).set('height', h);
});

canvas.on('mouse:up', function(options) {
    if(started) {
      started = false;
    }

    var square = canvas.getActiveObject();

    canvas.add(square);


    $.post("/diagram/" + diagram.diagramId, { diagram: JSON.stringify(canvas.toJSON()) });
});

canvas.on('object:modified', function() {
    console.log('object:modified');
})

canvas.on('after:render', function() {
    console.log('after:render')
})