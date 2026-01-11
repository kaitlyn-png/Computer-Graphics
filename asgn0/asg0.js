// DrawRectangle.js
function main() {
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var v1 = new Vector3([2.25, 2.25, 0]);
    drawVector(v1, "red", ctx);
    handleDrawEvent(ctx);
    handleDrawOperationEvent(ctx);
}

function drawVector(v, color, ctx) {
    var cx = ctx.canvas.width / 2;
    var cy = ctx.canvas.height / 2;
    var scale = 20;
    var ex = cx + v.elements[0] * scale;
    var ey = cy - v.elements[1] * scale;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function handleDrawEvent(ctx){
    const drawButton = document.getElementById("draw-button");
    const v1inputX = document.getElementById("v1-inputX");
    const v1inputY = document.getElementById("v1-inputY");
    const v2inputX = document.getElementById("v2-inputX");
    const v2inputY = document.getElementById("v2-inputY");

    drawButton.onclick = function() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var x = parseFloat(v1inputX.value);
        var y = parseFloat(v1inputY.value);
        var v1 = new Vector3([x, y, 0]);
        drawVector(v1, "red", ctx);
        var x2 = parseFloat(v2inputX.value);
        var y2 = parseFloat(v2inputY.value);
        var v2 = new Vector3([x2, y2, 0]);
        drawVector(v2, "blue", ctx);
    };
}

function handleDrawOperationEvent(ctx){
    const drawButton2 = document.getElementById("draw-button2");
    const v1inputX = document.getElementById("v1-inputX");
    const v1inputY = document.getElementById("v1-inputY");
    const v2inputX = document.getElementById("v2-inputX");
    const v2inputY = document.getElementById("v2-inputY");
    const operationSelect = document.getElementById("operation-select");
    const scalarInput = document.getElementById("scalar-input");

    drawButton2.onclick = function() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var x = parseFloat(v1inputX.value);
        var y = parseFloat(v1inputY.value);
        var v1 = new Vector3([x, y, 0]);
        drawVector(v1, "red", ctx);
        var x2 = parseFloat(v2inputX.value);
        var y2 = parseFloat(v2inputY.value);
        var v2 = new Vector3([x2, y2, 0]);
        drawVector(v2, "blue", ctx);

        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        if (operationSelect.value === "add") {
            v3 = v1.add(v2);
            
            drawVector(v3, "green", ctx);
        } else if (operationSelect.value === "sub") {
            v3 = v1.sub(v2);

            drawVector(v3, "green", ctx);
        } else if (operationSelect.value === "mul") {
            var scalar = parseFloat(scalarInput.value);
            v3 = v1.mul(scalar);
            var v4 = v2.mul(scalar);

            drawVector(v3, "green", ctx);
            drawVector(v4, "green", ctx);
        } else if (operationSelect.value === "div") {
            var scalar = parseFloat(scalarInput.value);
            v3 = v1.div(scalar);
            var v4 = v2.div(scalar);
            
            drawVector(v3, "green", ctx);
            drawVector(v4, "green", ctx);
        } else if (operationSelect.value === "angle") {
            var dot = Vector3.dot(v1, v2);
            var mag1 = v1.magnitude();
            var mag2 = v2.magnitude();
            var result = dot / (mag1 * mag2)
            var angle = Math.acos(result) * (180 / Math.PI); // Convert to degrees
            console.log("Angle: " + angle);
        } else if (operationSelect.value === "area") {
            areaTriangle(v1, v2);
        } else if (operationSelect.value === "magnitude") {
            var mag1 = v1.magnitude();
            var mag2 = v2.magnitude();
            console.log("Magnitude v1: " + mag1);
            console.log("Magnitude v2: " + mag2);
        } else if (operationSelect.value === "normalize") {
            v3 = v1.normalize();
            var v4 = v2.normalize();
            
            drawVector(v3, "green", ctx);
            drawVector(v4, "green", ctx);
        }
    };
}

function areaTriangle(v1, v2) { 
    var crossProduct = Vector3.cross(v1, v2);
    var area = 0.5 * crossProduct.magnitude();
    console.log("Area of Triangle: " + area);
}