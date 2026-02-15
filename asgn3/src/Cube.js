class Cube{
    constructor(){
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.textureNum = -1;
    }
    render(){
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // 0 0 0 --> left-bottom-front
        // 1 1 1 --> right-top-back
        
        // Front of cube
        drawTriangle3DUV( [0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0] );
        drawTriangle3DUV( [0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1] );

        // Pass the color of a point to u_FragColor  uniform variable
        //gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Top of cube
        drawTriangle3DUV( [0, 1, 0,  0, 1, 1,  1, 1, 1], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0, 1, 0,  1, 1, 1,  1, 1, 0], [0,0, 1,1, 1,0] );

        // Back of cube
        //gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3DUV( [0, 0, 1,  1, 0, 1,  1, 1, 1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0, 0, 1,  1, 1, 1,  0, 1, 1], [0,0, 1,1, 0,1] );

        // Bottom of cube
        //gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
        drawTriangle3DUV( [0, 0, 0,  0, 0, 1,  1, 0, 1], [0,0, 0,1, 1,1] );
        drawTriangle3DUV( [0, 0, 0,  1, 0, 1,  1, 0, 0], [0,0, 1,1, 1,0] );

        // Left of cube
        //gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
        drawTriangle3DUV( [0, 0, 0,  0, 0, 1,  0, 1, 1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [0, 0, 0,  0, 1, 1,  0, 1, 0], [0,0, 1,1, 0,1] );

        // Right of cube
        //gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);
        drawTriangle3DUV( [1, 0, 0,  1, 0, 1,  1, 1, 1], [0,0, 1,0, 1,1] );
        drawTriangle3DUV( [1, 0, 0,  1, 1, 1,  1, 1, 0], [0,0, 1,1, 1,0] );
    }
    renderfast(){
        var rgba = this.color;
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var allverts = [];
        var alluv = [];
        
        // Front of cube
        allverts = allverts.concat( [0, 0, 0,  1, 1, 0,  1, 0, 0] );
        alluv = alluv.concat( [0, 0,  1, 1,  1, 0] );
        allverts = allverts.concat( [0, 0, 0,  0, 1, 0,  1, 1, 0] );
        alluv = alluv.concat( [0, 0,  0, 1,  1, 1] );
        
        // Top of cube
        allverts = allverts.concat( [0, 1, 0,  0, 1, 1,  1, 1, 1] );
        alluv = alluv.concat( [0, 0,  0, 1,  1, 1] );
        allverts = allverts.concat( [0, 1, 0,  1, 1, 1,  1, 1, 0] );
        alluv = alluv.concat( [0, 0,  1, 1,  1, 0] );
        
        // Back of cube
        allverts = allverts.concat( [0, 0, 1,  1, 0, 1,  1, 1, 1] );
        alluv = alluv.concat( [0, 0,  1, 0,  1, 1] );
        allverts = allverts.concat( [0, 0, 1,  1, 1, 1,  0, 1, 1] );
        alluv = alluv.concat( [0, 0,  1, 1,  0, 1] );

        // Bottom of cube
        allverts = allverts.concat( [0, 0, 0,  0, 0, 1,  1, 0, 1] );
        alluv = alluv.concat( [0, 0,  0, 1,  1, 1] );
        allverts = allverts.concat( [0, 0, 0,  1, 0, 1,  1, 0, 0] );
        alluv = alluv.concat( [0, 0,  1, 1,  1, 0] );

        // Left of cube
        allverts = allverts.concat( [0, 0, 0,  0, 0, 1,  0, 1, 1] );
        alluv = alluv.concat( [0, 0,  1, 0,  1, 1] );
        allverts = allverts.concat( [0, 0, 0,  0, 1, 1,  0, 1, 0] );
        alluv = alluv.concat( [0, 0,  1, 1,  0, 1] );

        // Right of cube
        allverts = allverts.concat( [1, 0, 0,  1, 0, 1,  1, 1, 1] );
        alluv = alluv.concat( [0, 0,  1, 0,  1, 1] );
        allverts = allverts.concat( [1, 0, 0,  1, 1, 1,  1, 1, 0] );
        alluv = alluv.concat( [0, 0,  1, 1,  0, 1] );

        drawTriangle3DUVFast(allverts, alluv);
    }

    renderWithFaceTextures(topBotTexNum, sideTexNum) {
        var rgba = this.color;
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // Build vertices and UVs for all side faces
        var sideVerts = [];
        var sideUv = [];
        
        // Front of cube
        sideVerts = sideVerts.concat( [0, 0, 0,  1, 1, 0,  1, 0, 0] );
        sideUv = sideUv.concat( [0, 0,  1, 1,  1, 0] );
        sideVerts = sideVerts.concat( [0, 0, 0,  0, 1, 0,  1, 1, 0] );
        sideUv = sideUv.concat( [0, 0,  0, 1,  1, 1] );

        // Back of cube
        sideVerts = sideVerts.concat( [0, 0, 1,  1, 0, 1,  1, 1, 1] );
        sideUv = sideUv.concat( [0, 0,  1, 0,  1, 1] );
        sideVerts = sideVerts.concat( [0, 0, 1,  1, 1, 1,  0, 1, 1] );
        sideUv = sideUv.concat( [0, 0,  1, 1,  0, 1] );

        // Left of cube
        sideVerts = sideVerts.concat( [0, 0, 0,  0, 0, 1,  0, 1, 1] );
        sideUv = sideUv.concat( [0, 0,  1, 0,  1, 1] );
        sideVerts = sideVerts.concat( [0, 0, 0,  0, 1, 1,  0, 1, 0] );
        sideUv = sideUv.concat( [0, 0,  1, 1,  0, 1] );

        // Right of cube
        sideVerts = sideVerts.concat( [1, 0, 0,  1, 0, 1,  1, 1, 1] );
        sideUv = sideUv.concat( [0, 0,  1, 0,  1, 1] );
        sideVerts = sideVerts.concat( [1, 0, 0,  1, 1, 1,  1, 1, 0] );
        sideUv = sideUv.concat( [0, 0,  1, 1,  0, 1] );
        
        // Draw all side faces with side texture
        gl.uniform1i(u_whichTexture, sideTexNum);
        drawTriangle3DUVFast(sideVerts, sideUv);
        
        // Build vertices and UVs for top and bottom faces
        var topBottomVerts = [];
        var topBottomUv = [];
        
        // Top of cube
        topBottomVerts = topBottomVerts.concat( [0, 1, 0,  0, 1, 1,  1, 1, 1] );
        topBottomUv = topBottomUv.concat( [0, 0,  0, 1,  1, 1] );
        topBottomVerts = topBottomVerts.concat( [0, 1, 0,  1, 1, 1,  1, 1, 0] );
        topBottomUv = topBottomUv.concat( [0, 0,  1, 1,  1, 0] );

        // Bottom of cube
        topBottomVerts = topBottomVerts.concat( [0, 0, 0,  0, 0, 1,  1, 0, 1] );
        topBottomUv = topBottomUv.concat( [0, 0,  0, 1,  1, 1] );
        topBottomVerts = topBottomVerts.concat( [0, 0, 0,  1, 0, 1,  1, 0, 0] );
        topBottomUv = topBottomUv.concat( [0, 0,  1, 1,  1, 0] );
        
        // Draw all top/bottom faces with top/bottom texture
        gl.uniform1i(u_whichTexture, topBotTexNum);
        drawTriangle3DUVFast(topBottomVerts, topBottomUv);
    }
}