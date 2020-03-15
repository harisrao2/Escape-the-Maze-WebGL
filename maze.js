"use strict";

var canvas;
var gl;

var positions = [];
var program;
var canvas;
var gl;

var startI = 0;
var startJ = 0;
var endI = 0;
var endJ = 0;
var direction = 'right';

var checkInEnd = false;
var scale = 0.1;
var scalediv = 0;
var ratCellI, ratCellJ, mazeA, mazeO, n, m;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    document.addEventListener('keydown', function(event) {
        // rotating left
        if (event.keyCode == 37) {
            switch(direction){
                case 'right':
                    direction = 'up';
                    facingUp();
                    drawMaze(mazeA, n, m);
                    break;
                case 'up':
                    direction = 'left';
                    facingLeft();
                    drawMaze(mazeA, n, m);
                    break;
                case 'left':
                    direction = 'down';
                    facingDown();
                    drawMaze(mazeA, n, m);
                    break;
                case 'down':
                    direction = 'right';
                    facingRight();
                    drawMaze(mazeA, n, m);
                    break;
            }

        }
        else if (event.keyCode == 38) {
            moveRat();
        }
        else if (event.keyCode == 39) {
            switch(direction){
                case 'right':
                    direction = 'down';
                    facingDown();
                    drawMaze(mazeA, n, m);
                    break;
                case 'down':
                    direction = 'left';
                    facingLeft();
                    drawMaze(mazeA, n, m);
                    break;
                case 'left':
                    direction = 'up';
                    facingUp();
                    drawMaze(mazeA, n, m);
                    break;
                case 'up':
                    direction = 'right';
                    facingRight();
                    drawMaze(mazeA, n, m);
                    break;
            }
        }
    }, true);

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINES, 0, positions.length);
    if(checkInEnd){
        checkInEnd = false;
        alert("You Won");
        window.location.reload(true);
    }
}


function findScale(n,m){
    var maxval = Math.max(n,m);
    scalediv = Math.ceil(maxval/10);
    //scalediv = scale/10;
    scale = scale/scalediv
    scale = scale*1.95;
    console.log("scaleeeeeee:" + scale);

}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    var nStr = str.substr(0,index) + chr + str.substr(index+1);
    return nStr;
}



function visitCell(mazeA, mazeO, i, j)
{
    mazeO[i][j] = 'v';
    // Checking if right cell is visited
    var roller = [0,1,2,3];
    var p;
    var rand = Math.floor(Math.random() * 4);
    for(p=0;p<=roller.length;p++){
        var order = Math.floor(Math.random() * roller.length);
        roller.splice(order,1);
        switch(order){
            case 0:
                if (i < mazeA.length - 1 && mazeO[i + 1][j] == 'u')
                {
                    mazeA[i][j] = setCharAt(mazeA[i][j], 1, '0');
                    mazeA[i + 1][j] = setCharAt(mazeA[i + 1][j], 3, '0');
                    visitCell(mazeA, mazeO, i + 1, j);
                }
            case 1:
                // Checking if above cell is visited
                if (j < mazeA[0].length - 1 && mazeO[i][j + 1] == 'u')
                {
                    mazeA[i][j] = setCharAt(mazeA[i][j], 2, '0');
                    mazeA[i][j + 1] = setCharAt(mazeA[i][j + 1], 0, '0');
                    visitCell(mazeA, mazeO, i, j + 1);
                }
            case 2:
                // Checking if left cell is visited
                if (i > 0 && mazeO[i - 1][j] == 'u')
                {
                    mazeA[i][j] = setCharAt(mazeA[i][j], 3, '0');
                    mazeA[i - 1][j] = setCharAt(mazeA[i - 1][j], 1, '0');
                    visitCell(mazeA, mazeO, i - 1, j);
                }
            case 3:
                // Checking if below cell is visited
                if (j > 0 && mazeO[i][j - 1] == 'u')
                {
                    mazeA[i][j] = setCharAt(mazeA[i][j], 0, '0');
                    mazeA[i][j - 1] = setCharAt(mazeA[i][j - 1], 2, '0');
                    visitCell(mazeA, mazeO, i, j - 1);
                }
            }
        }
}

function drawMaze(mazeA, n, m)
{
    for (var i = 0; i < n; i++)
    {
        for (var j = 0; j < m; j++)
        {
            // connect left wall 0001
            if (mazeA[i][j][3] == '1')
            {
                positions.push(vec2(scale * i-0.95, scale * j-0.95));
                positions.push(vec2(scale * i-0.95, scale * (j + 1)-0.95));
            }
            // connect above wall 0010
            if (mazeA[i][j][2] == '1')
            {
                positions.push(vec2(scale * i-0.95, scale * (j + 1)-0.95));
                positions.push(vec2(scale * (i + 1)-0.95, scale * (j + 1)-0.95));
            }
            // connect right wall 0100
            if (mazeA[i][j][1] == '1')
            {
                positions.push(vec2(scale * (i + 1)-0.95, scale * j-0.95))
                positions.push(vec2(scale * (i + 1)-0.95, scale * (j + 1)-0.95));
            }
            // connect below wall 1000
            if (mazeA[i][j][0] == '1')
            {
                positions.push(vec2(scale * i-0.95, scale * j-0.95));
                positions.push(vec2(scale * (i + 1)-0.95, scale * j-0.95));
            }
        }
    }

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    render();
}

function ready()
{
    positions.length = 0;
    mazeA = [];
    mazeO = [];
    n = document.getElementById( "n" ).value;
    m = document.getElementById( "m" ).value;

    scale = 0.1;
    scalediv=0;
    findScale(n,m);


    for (var i = 0; i < n; i++)
    {
        mazeA[i] = [];
        mazeO[i] = [];
        for (var j = 0; j < m; j++)
        {
            mazeA[i][j] = '1111';
            mazeO[i][j] = 'u';
        }
    }


    var a = Math.floor(Math.random() * n);
    var b = Math.floor(Math.random() * m);
    console.log('a: ' + a);
    console.log('b: ' + b);
    visitCell(mazeA, mazeO, a, b);


    console.log(mazeA);

    startI = Math.floor(Math.random() * n);
    startJ = Math.floor(Math.random() * m);
    endI = Math.floor(Math.random() * n);
    endJ = Math.floor(Math.random() * m);
    if (startI != 0 && startI != n)
    {
        var temp = Math.floor(Math.random() * 2);
        if (temp)
        {
            startJ = 0;
        }
        else
        {
            startJ = m - 1;
        }
    }
    if (startI == 0)
    {
        endI = n - 1;
        mazeA[startI][startJ] = setCharAt(mazeA[startI][startJ], 3, '0');
        mazeA[endI][endJ] = setCharAt(mazeA[endI][endJ], 1, '0');
    }
    else if(startI == n - 1)
    {
        endI = 0;
        mazeA[startI][startJ] = setCharAt(mazeA[startI][startJ], 1, '0');
        mazeA[endI][endJ] = setCharAt(mazeA[endI][endJ], 3, '0');
    }
    else if(startJ == 0)
    {
        endJ = m - 1;
        mazeA[startI][startJ] = setCharAt(mazeA[startI][startJ], 0, '0');
        mazeA[endI][endJ] = setCharAt(mazeA[endI][endJ], 2, '0');
    }
    else if(startJ == m - 1)
    {
        endJ = 0;
        mazeA[startI][startJ] = setCharAt(mazeA[startI][startJ], 2, '0');
        mazeA[endI][endJ] = setCharAt(mazeA[endI][endJ], 0, '0');
    }

    

    ratCellI = startI;
    ratCellJ = startJ;
    facingRight();
    drawMaze(mazeA, n, m);

    
}






function moveRat()
{
    if (direction == 'right' && ratCellI < mazeA.length - 1 && mazeA[ratCellI][ratCellJ][1] == '0')
    {
        ratCellI++;
        facingRight();
    }
    else if (direction == 'up' && ratCellJ < mazeA[0].length -1 && mazeA[ratCellI][ratCellJ][2] == '0')
    {
        ratCellJ++;
        facingUp();
    }
    else if (direction == 'left' && ratCellI > 0 && mazeA[ratCellI][ratCellJ][3] == '0')
    {
        ratCellI--;
        facingLeft();
    }
    else if (direction == 'down' && ratCellJ > 0 && mazeA[ratCellI][ratCellJ][0] == '0')
    {
        ratCellJ--;
        facingDown();
    }
    drawMaze(mazeA, n, m);
    if(ratCellI  == endI && ratCellJ == endJ){
        checkInEnd = true;
    
    }else{
        checkInEnd = false;
    }
}
function facingRight()
{
    positions.length = 0;
    //body
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    //face
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.95*scale-0.95, ratCellJ * scale + 0.5*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.95*scale-0.95, ratCellJ * scale + 0.5*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
}

function facingLeft()
{
    positions.length = 0;
    //body
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
    //face
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.05*scale-0.95, ratCellJ * scale + 0.5*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.05*scale-0.95, ratCellJ * scale + 0.5*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
}

function facingUp()
{
    positions.length = 0;
    //body
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
    //face
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.5*scale-0.95, ratCellJ * scale + 0.95*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.5*scale-0.95, ratCellJ * scale + 0.95*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.25*scale-0.95));
}

function facingDown()
{
    positions.length = 0;
    //body
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    //face
    positions.push(vec2(ratCellI * scale + 0.75*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.5*scale-0.95, ratCellJ * scale + 0.05*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.5*scale-0.95, ratCellJ * scale + 0.05*scale-0.95));
    positions.push(vec2(ratCellI * scale + 0.25*scale-0.95, ratCellJ * scale + 0.75*scale-0.95));
}

