// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform sampler2D u_Sampler6;
  uniform sampler2D u_Sampler7;
  uniform int u_whichTexture;
  uniform float u_texColorWeight;
  void main() {
    vec4 baseColor = u_FragColor;
    vec4 texColor;
    
    if (u_whichTexture == -2) {
      texColor = u_FragColor; // use color
    } else if (u_whichTexture == -1) {
      texColor = vec4(v_UV, 1.0, 1.0); // use UV as color
    } else if (u_whichTexture == 0) {
      texColor = texture2D(u_Sampler0, v_UV); // use texture0
    } else if (u_whichTexture == 1) {
      texColor = texture2D(u_Sampler1, v_UV); // use texture1
    } else if (u_whichTexture == 2) {
      texColor = texture2D(u_Sampler2, v_UV); // use texture2
    } else if (u_whichTexture == 3) {
      texColor = texture2D(u_Sampler3, v_UV); // use texture3
    } else if (u_whichTexture == 4) {
      texColor = texture2D(u_Sampler4, v_UV); // use texture4
    } else if (u_whichTexture == 5) {
      texColor = texture2D(u_Sampler5, v_UV); // use texture5
    } else if (u_whichTexture == 6) {
      texColor = texture2D(u_Sampler6, v_UV); // use texture6
    } else if (u_whichTexture == 7) {
      texColor = texture2D(u_Sampler7, v_UV); // use texture7
    }
    else {
      texColor = vec4(1, 0.2, 0.2, 1); // error
    }
    
    // Linear interpolate between base color and texture color
    gl_FragColor = mix(baseColor, texColor, u_texColorWeight);
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_whichTexture;
let u_texColorWeight;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;
let u_ProjectionMatrix;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;

// Texture variables
let g_texture0;
let g_texture1;
let g_texture2;
let g_texture3;
let g_texture4;
let g_texture5;
let g_texture6;
let g_texture7;
// Camera variables
let g_camera;

const MAP_SIZE = 32;
const MAX_WALL_HEIGHT = 4;

// ROTATING VARIABLES
let g_globalSideAngle = 0;
let g_globalUpAngle = 0;
let g_mouseDown = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

// COLLECTION SYSTEM VARIABLES
let g_logsCollected = 0;
let g_hayCollected = 0;
const LOGS_NEEDED = 10;
const HAY_NEEDED = 4;

document.onmouseup = function () {
  g_mouseDown = false;
};

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Mouse functions
  canvas.onmousedown = onMouseDown;
  canvas.onmousemove = onMouseMove;
  canvas.onmouseenter = onMouseEnter;
  canvas.onmouseleave = onMouseLeave;
  
  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LESS);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  } 

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  } 
  
  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program,'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program,'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program,'u_whichTexture');

  // Get the storage location of u_texColorWeight
  u_texColorWeight = gl.getUniformLocation(gl.program,'u_texColorWeight');

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program,'u_Sampler0');

  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program,'u_Sampler1');

  // Get the storage location of u_Sampler2
  u_Sampler2 = gl.getUniformLocation(gl.program,'u_Sampler2');

  // Get the storage location of u_Sampler3
  u_Sampler3 = gl.getUniformLocation(gl.program,'u_Sampler3');
  
  // Get the storage location of u_Sampler4
  u_Sampler4 = gl.getUniformLocation(gl.program,'u_Sampler4');

  // Get the storage location of u_Sampler5
  u_Sampler5 = gl.getUniformLocation(gl.program,'u_Sampler5');

  // Get the storage location of u_Sampler6
  u_Sampler6 = gl.getUniformLocation(gl.program,'u_Sampler6');

  // Get the storage location of u_Sampler7
  u_Sampler7 = gl.getUniformLocation(gl.program,'u_Sampler7');

  // Set an inital value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
}

// CONSTANTS
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// GLOBAL VARIABLES
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5.0;
let g_selectedShape = POINT;
let g_globalAngle = 0.0;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
}

function initTextures(){
  loadTexture('textures/sky.png', 0);
  loadTexture('textures/grass.jpg', 1);
  loadTexture('textures/dirt.png', 2);
  loadTexture('textures/log.jpg', 3);
  loadTexture('textures/log-top.jpg', 4);
  loadTexture('textures/grass-side.jpg', 5);
  loadTexture('textures/hay-side.jpg', 6);
  loadTexture('textures/hay-top.jpg', 7);
  return true;
}

function loadTexture(src, textureUnit) {
  var image = new Image();
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  image.onload = function(){ sendTexturetoGLSL(image, textureUnit, src); };
  image.onerror = function(){ 
    console.log('Failed to load texture image: ' + src);
    console.log('Make sure you are running a web server');
  };
  image.src = src;
  return true;
}

function sendTexturetoGLSL(image, textureUnit, src) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  if (textureUnit === 0) {
    g_texture0 = texture;
  } else if (textureUnit === 1) {
    g_texture1 = texture;
  } else if (textureUnit === 2) {
    g_texture2 = texture;
  } else if (textureUnit === 3) {
    g_texture3 = texture;
  } else if (textureUnit === 4) {
    g_texture4 = texture;
  } else if (textureUnit === 5) {
    g_texture5 = texture;
  } else if (textureUnit === 6) {
    g_texture6 = texture;
  } else if (textureUnit === 7) { 
    g_texture7 = texture;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (textureUnit === 0) {
    gl.uniform1i(u_Sampler0, 0);
  } else if (textureUnit === 1) {
    gl.uniform1i(u_Sampler1, 1);
  } else if (textureUnit === 2) {
    gl.uniform1i(u_Sampler2, 2);
  } else if (textureUnit === 3) {
    gl.uniform1i(u_Sampler3, 3);
  } else if (textureUnit === 4) {
    gl.uniform1i(u_Sampler4, 4);
  } else if (textureUnit === 5) {
    gl.uniform1i(u_Sampler5, 5);
  } else if (textureUnit === 6) {
    gl.uniform1i(u_Sampler6, 6);
  } else if (textureUnit === 7) {
    gl.uniform1i(u_Sampler7, 7);
  }

  console.log('Texture loaded successfully', src, image.width + 'x' + image.height);
}

// Main Function
function main() {

  // Set up Canvas and WebGL context
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Initialize camera
  g_camera = new Camera();

  // Set camera bounds to stay within the map
  var padding = 0.5;
  var half = MAP_SIZE / 2;
  g_camera.setBounds(
    -half + padding,
    half - padding,
    -1 + padding,
    half - padding,
    -half + padding,
    half - padding
  );

  g_globalSideAngle = g_camera.yaw;
  g_globalUpAngle = g_camera.pitch;

  document.onkeydown = keydown;

  initTextures();

  // Color to clear <canvas>
  gl.clearColor(0.741, 0.901, 0.950, 1.0); // background color
  gl.clearDepth(1.0);

  //renderScene();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenver its time
function tick(){
  // Save current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  updateAnimationAngles();

  // Draw everything
  renderScene();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}


// Update the angles of everything if currently animated
function updateAnimationAngles() {

}

function onMouseDown(ev) {
  g_mouseDown = true;
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;

  // // Left click to delete block
  // if (ev.button === 0) {
  //   deleteBlock();
  // }
  // // Right click to add block
  // else if (ev.button === 2) {
  //   addBlock();
  // }
}

function onMouseLeave(ev){
  g_mouseDown = false;
}

function onMouseEnter(ev){
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;
}

function onMouseMove(ev) {
  // Camera look controls when mouse is down
  if (g_mouseDown && g_camera) {
    let dx = ev.clientX - g_lastMouseX;
    g_camera.look(dx, 0);
    g_globalSideAngle = g_camera.yaw;
    g_globalUpAngle = g_camera.pitch;
    g_lastMouseX = ev.clientX;
  }
}

function keydown(ev) {
  if (!g_camera) return;

  if (ev.keyCode == 87) { // W
    g_camera.moveForward();
  } else if (ev.keyCode == 83) { // S
    g_camera.moveBackward();
  } else if (ev.keyCode == 65) { // A
    g_camera.moveLeft();
  } else if (ev.keyCode == 68) { // D
    g_camera.moveRight();
  } else if (ev.keyCode == 81) { // Q
    g_camera.turnLeft();
  } else if (ev.keyCode == 69) { // E
    g_camera.turnRight();
  } else if (ev.keyCode == 70) { // F - delete block
    deleteBlock();
  } else if (ev.keyCode == 82) { // R - add block
    addBlock();
  }

  renderScene();
}

// Find the map block directly in front of the camera
function getBlockInFront() {
  if (!g_camera) return null;
  
  // Look 1 units in front of the camera
  var distance = 1;
  var pos = g_camera.position;
  var front = g_camera.front;
  
  var x = pos[0] + front[0] * distance;
  var y = pos[1] + front[1] * distance;
  var z = pos[2] + front[2] * distance;
  
  // Convert world coordinates to map coordinates
  var blockX = Math.round(x + MAP_SIZE / 2);
  var blockZ = Math.round(z + MAP_SIZE / 2);
  
  // Check bounds
  if (blockX < 0 || blockX >= MAP_SIZE || blockZ < 0 || blockZ >= MAP_SIZE) {
    console.log('Block in front is out of bounds');
    return null;
  }
  
  return { x: blockX, z: blockZ };
}

// Raycast to find block where camera is looking
function getBlockWhereLooking() {
  if (!g_camera) return null;
  
  var origin = g_camera.position;
  var dir = g_camera.front;
  
  var maxDistance = 10;
  var step = 0.1;
  
  for (var dist = 0.5; dist < maxDistance; dist += step) {
    var x = origin[0] + dir[0] * dist;
    var y = origin[1] + dir[1] * dist;
    var z = origin[2] + dir[2] * dist;
    
    var blockX = Math.floor(x + MAP_SIZE / 2);
    var blockZ = Math.floor(z + MAP_SIZE / 2);
    var blockY = Math.floor(y);
    
    // Check bounds
    if (blockX < 0 || blockX >= MAP_SIZE || blockZ < 0 || blockZ >= MAP_SIZE) {
      continue;
    }
    
    // Check if there's a block at this position
    var height = g_map[blockZ][blockX];
    if (blockY >= 0 && blockY < height) {
      return { x: blockX, z: blockZ, y: blockY };
    }
  }
  
  return null;
}

// Add a block where the camera is looking
function addBlock() {
  var block = getBlockWhereLooking();
  if (!block) return;
  
  var currentHeight = g_map[block.z][block.x];
  
  if (currentHeight < MAX_WALL_HEIGHT) {
    g_map[block.z][block.x] = currentHeight + 1;
    console.log('Added block at map (' + block.x + ', ' + block.z + '), new height: ' + g_map[block.z][block.x]);
  } else {
    console.log('Max height reached at (' + block.x + ', ' + block.z + ')');
  }
}

// Delete a block where the camera is looking
function deleteBlock() {
  var block = getBlockWhereLooking();
  if (!block) return;
  
  var currentHeight = g_map[block.z][block.x];
  
  // Check block type before deleting for collection system
  if (currentHeight === 3) {
    g_logsCollected++;
    console.log('Log collected! Total: ' + g_logsCollected);
  } else if (currentHeight === 4) {
    g_hayCollected++;
    console.log('Hay collected! Total: ' + g_hayCollected);
  }
  
  // Decrease height at this location
  if (currentHeight > 0) {
    g_map[block.z][block.x] = currentHeight - 1;
    console.log('Deleted block at map (' + block.x + ', ' + block.z + '), new height: ' + g_map[block.z][block.x]);
  } else {
    console.log('No block to delete at (' + block.x + ', ' + block.z + ')');
  }
  
  // Check if game is won
  checkGameCompletion();
}

// Function to check if player has collected enough items
function checkGameCompletion() {
  if (g_logsCollected >= LOGS_NEEDED && g_hayCollected >= HAY_NEEDED) {
    alert('You completed the game! ✨\n\nCollected ' + g_logsCollected + ' logs and ' + g_hayCollected + ' hay!');
    // Reset the game
    g_logsCollected = 0;
    g_hayCollected = 0;
    // Rebuild the world
    resetWorld();
  }
}

// Function to reset the world map
function resetWorld() {
  // Restore the original map
  g_map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 1],
    [1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
}

// 2D height map for the world
var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 1],
  [1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 2, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

function drawMap(){
  for (let x = 0; x < g_map.length; x++){
    for (let z = 0; z < g_map[x].length; z++){
      var height = getMapHeight(x, z);
      for (let y = 0; y < height; y++){
        var wall = new Cube();
        wall.color = [1.0, 1.0, 1.0, 1.0];        
        wall.matrix.translate(x - MAP_SIZE / 2, y, z - MAP_SIZE / 2);
        if (height >= 3) {
          wall.renderWithFaceTextures(4, 3);
        } else if (height == 2) {
          wall.renderWithFaceTextures(7, 6);
        }
        else {
          wall.renderWithFaceTextures(1, 5);
        }
      }
    }
  }
}

function drawGround(){
  for (let x = 0; x < MAP_SIZE; x++){
    for (let z = 0; z < MAP_SIZE; z++){
      var tile = new Cube();
      tile.color = [1.0, 1.0, 1.0, 1.0];
      tile.textureNum = 1;
      tile.matrix.translate(x - MAP_SIZE / 2, -1, z - MAP_SIZE / 2);
      tile.renderfast();
    }
  }
}

function getMapHeight(x, z) {
  if (!g_map[x] || g_map[x][z] == null) {
    return 0;
  }
  var height = g_map[x][z];
  height = Math.max(0, Math.min(MAX_WALL_HEIGHT, height));
  return height;
}

function renderScene(){
  
  // Check the time at the start of this funciton
  var startTime = performance.now();

  // Pass the projection matrix from camera
  var projMat = g_camera ? g_camera.getProjectionMatrix() : new Matrix4();
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = g_camera ? g_camera.getViewMatrix() : new Matrix4();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the global rotation matrix
  var globalRotMat = new Matrix4();
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Bind texture if loaded
  if (g_texture0) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, g_texture0);
  }
  if (g_texture1) {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, g_texture1);
  }
  if (g_texture2) {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, g_texture2);
  }
  if (g_texture3) {
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, g_texture3);
  }
  if (g_texture4) {
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, g_texture4);
  }
  if (g_texture5) {
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, g_texture5);
  }
  if (g_texture6) {
    gl.activeTexture(gl.TEXTURE6);
    gl.bindTexture(gl.TEXTURE_2D, g_texture6);
  }
  if (g_texture7) {
    gl.activeTexture(gl.TEXTURE7);
    gl.bindTexture(gl.TEXTURE_2D, g_texture7);
  }
  
  // Draw the ground with texture
  gl.uniform1f(u_texColorWeight, 1.0);
  drawGround();
  
  // Draw the map with texture
  gl.uniform1f(u_texColorWeight, 1.0);
  drawMap();

  // Draw the sky
  gl.uniform1f(u_texColorWeight, 0.5);
  var sky = new Cube();
  sky.color = [0.679, 0.863, 0.930, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(MAP_SIZE, MAP_SIZE, MAP_SIZE);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  // Check the time at the end of this funciton
  var duration = performance.now() - startTime;
  //sendTextToHTML(" fps: " + Math.round(Math.floor(10000/duration)/10), "numdot");
  
  // Update item counter
  updateItemCounter();
}

// Function to update the item collection counter in the UI
function updateItemCounter() {
  var counterText = "Logs: " + g_logsCollected + "/" + LOGS_NEEDED + " | Hay: " + g_hayCollected + "/" + HAY_NEEDED;
  sendTextToHTML(counterText, "itemCounter");
}

// Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}