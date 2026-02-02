class Triangle{
    constructor(){
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.rotate = 0;
    }
    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        var rotate = this.rotate;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);

        // Draw
        var d = this.size/200.0; // delta
        
        // Create triangle vertices
        var vertices = [xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d];
        
        // Apply rotation if needed
        if (rotate != 0) {
            vertices = this.rotateVertices(vertices, xy, rotate);
        }
        
        drawTriangle(vertices);
        console.log(vertices);
    }
    
    rotateVertices(vertices, center, angle) {
        // Convert angle to radians
        var rad = angle * Math.PI / 180;
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
        
        var rotated = [];
        for (var i = 0; i < vertices.length; i += 2) {
            var x = vertices[i] - center[0];
            var y = vertices[i+1] - center[1];
            
            // Apply rotation matrix
            var newX = x * cos - y * sin;
            var newY = x * sin + y * cos;
            
            rotated.push(newX + center[0]);
            rotated.push(newY + center[1]);
        }
        return rotated;
    }
}

function drawTriangle(vertices) {
    var n = 3; // Number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);   

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
    var n = 3; // Number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);   

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);
}