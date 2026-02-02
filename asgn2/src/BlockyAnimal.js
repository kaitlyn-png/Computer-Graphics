// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas, gl, a_Position, u_FragColor, u_Size, u_ModelMatrix, u_GlobalRotateMatrix;
let g_mouseDown = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;

// ROTATING VARIABLES
let g_globalSideAngle = 0;
let g_globalUpAngle = 0;

let g_leftLegAngle = 0;
let g_rightLegAngle = 0;
let g_leftFootAngle = 0;
let g_rightFootAngle = 0;

// ANIMATION VARIABLES
let g_penguinAnimation = false;

// ARM ANGLES
let g_leftArmAngle = 0;
let g_rightArmAngle = 0;

// HEAD TILT
let g_headTilt = 0;

let g_blink = false;
let g_lastBlinkTime = 0;
const BLINK_INTERVAL = 3.5;   // seconds between blinks
const BLINK_DURATION = 0.12;  // how long eyelid stays closed

// POKE VARIABLES
let g_wink = false;
let g_winkStartTime = 0;
const WINK_DURATION = 0.3;

// FISH FLOP
let g_fishFlop = 0;

document.onmouseup = function () {
  g_mouseDown = false;
};

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  
  // DEFINING MOUSE FUNCTIONS
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

  // Set an inital value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById("exportButton").addEventListener("click", () => { exportDrawing(); });

  // Slider Events
  document.getElementById('angleSideSlide').addEventListener('input', function(event) { g_globalSideAngle = this.value; renderScene(); });
  document.getElementById('angleUpSlide').addEventListener('input', function(event) { g_globalUpAngle = this.value; renderScene(); });

  // Rotation Events
  document.getElementById('leftLegSlide').addEventListener('input', function(event) { g_leftLegAngle = this.value; renderScene(); });
  document.getElementById('rightLegSlide').addEventListener('input', function(event) { g_rightLegAngle = this.value; renderScene(); });
  document.getElementById('leftFootSlide').addEventListener('input', function(event) { g_leftFootAngle = this.value; renderScene(); });
  document.getElementById('rightFootSlide').addEventListener('input', function(event) { g_rightFootAngle = this.value; renderScene(); });

  // Animation Events
  document.getElementById('animationOnButton').onclick = function() { g_penguinAnimation = true };
  document.getElementById('animationOffButton').onclick = function() { g_penguinAnimation = false };
}

// Main Function
function main() {

  // Set up Canvas and WebGL context
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

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

  // update sliders when variables are changed during animations
  updateSliders()

  // Draw everything
  renderScene();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = []; // List of shapes in the canvas

const LEG_MIN = -10;
const LEG_MAX = 7;

// Update the angles of everything if currently animated
function updateAnimationAngles() {

  // WALKING ANIMATION
  if (g_penguinAnimation) {
    const LEG_MIN = -7;
    const LEG_MAX = 7;
    const range = LEG_MAX - LEG_MIN;
    const WALK_SPEED = 2.5;
    const s = Math.sin(WALK_SPEED * g_seconds);
    const f = Math.sin(WALK_SPEED * g_seconds + Math.PI/2);

    // LEG ANGLES
    g_leftLegAngle  = (( s + 1) / 2) * range + LEG_MIN;
    g_rightLegAngle = ((-s + 1) / 2) * range + LEG_MIN;
    
    // FOOT ANGLES
    const FOOT_RANGE = 20;
    g_leftFootAngle  = (( f + 1) / 2) * FOOT_RANGE + LEG_MIN;
    g_rightFootAngle = ((-f + 1) / 2) * FOOT_RANGE + LEG_MIN;

    // ARM SWING
    const ARM_SWING_ANGLE = 15;
    g_leftArmAngle  = ARM_SWING_ANGLE * s;  // opposite left leg
    g_rightArmAngle =  -ARM_SWING_ANGLE * s;  // opposite right leg

    // HEAD TILT
    g_headTilt = ((s + 1) / 2) * 1;

    // FISH FLOP
    g_fishFlop = ((s + 1) / 2) * 5;

    // LEFT EYE BLINK
    if (!g_blink && (g_seconds - g_lastBlinkTime > BLINK_INTERVAL)) {
      g_blink = true;
      g_lastBlinkTime = g_seconds;
    }

    if (g_blink && (g_seconds - g_lastBlinkTime > BLINK_DURATION)) {
      g_blink = false;
    }

  } else {
    g_blink = false;
  }

  // RIGHT EYE WINK TIMEOUT
  if (g_wink && (g_seconds - g_winkStartTime > WINK_DURATION)) {
    g_wink = false;
  }
}

// TO UPDATE SIDE AND TOP SLIDERS

function onMouseDown(ev) {
  g_mouseDown = true;
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;

  // SHIFT + click → wink
  if (ev.shiftKey) {
    g_wink = true;
    g_winkStartTime = g_seconds;
  }
}

function onMouseLeave(ev){
  g_mouseDown = false;
}

function onMouseEnter(ev){
  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;
}

function onMouseMove(ev) {
  if (!g_mouseDown) return;

  let dx = ev.clientX - g_lastMouseX;
  let dy = ev.clientY - g_lastMouseY;

  g_globalSideAngle += dx * 0.5;
  g_globalUpAngle   += dy * 0.5;

  g_globalUpAngle   = Math.max(-90, Math.min(90, g_globalUpAngle));
  g_globalSideAngle = Math.max(-180, Math.min(180, g_globalSideAngle));

  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;

  angleSideSlide.value = g_globalSideAngle;
  angleUpSlide.value   = g_globalUpAngle;
}

// UPDATE SLIDERS WHEN THE ANIMATION IS PLAYING
function updateSliders() {
  leftLegSlide.value = g_leftLegAngle;
  rightLegSlide.value  = g_rightLegAngle;
  leftFootSlide.value = g_leftFootAngle;
  rightFootSlide.value  = g_rightFootAngle;
}

function renderScene(){
  
  // Check the time at the start of this funciton
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalUpAngle, 1, 0, 0);
  globalRotMat.rotate(g_globalSideAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // PENGUIN 

  // Draw body cube
  // var body = new Cube();
  // body.color = [1.0, 1.0, 1.0, 1.0]; // WHITE
  // body.matrix.translate(-0.25, -0.425, 0.0);
  // body.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  // body.matrix.scale(0.5, 0.45, 0.5);
  // body.render();

  // // COAT
  
  // var coatBody = new Cube();
  // coatBody.color = [0.117, 0.00, 0.140, 1.0]; // PURPLE/BLACK
  // coatBody.matrix.translate(-0.2775, -0.4225, 0.01);
  // coatBody.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  // //coatBody.matrix.scale(0.555, 0.795, 0.525);
  // coatBody.matrix.scale(0.555, 0.45, 0.525);
  // coatBody.render();

  // var coatHead = new Cube();
  // coatHead.color = [0.117, 0.00, 0.140, 1.0]; // PURPLE/BLACK
  // coatHead.matrix.translate(-0.2775, -0.01, -0.03);
  // coatHead.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  // coatHead.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  // coatHead.matrix.scale(0.555, 0.405, 0.525);
  // coatHead.render();

  // // HEAD
  // var head = new Cube();
  // head.color = [1.0, 1.0, 1.0, 1.0]; // WHITE
  // head.matrix.translate(-0.25, 0, -0.0375);
  // head.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  // head.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  // head.matrix.scale(0.5, 0.35, 0.5);
  // head.render();

  // BODY
  var body = new Cube();
  body.color = [1.0, 1.0, 1.0, 1.0]; // WHITE

  body.matrix.setIdentity();
  body.matrix.translate(-0.25, -0.4225, 0.0);
  body.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  body.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  body.matrix.scale(0.5, 0.8, 0.5);

  body.render();


  // COAT
  var coatBody = new Cube();
  coatBody.color = [0.117, 0.00, 0.140, 1.0]; // PURPLE/BLACK
  coatBody.matrix.translate(-0.2775, -0.42, 0.01);
  coatBody.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  coatBody.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  coatBody.matrix.scale(0.555, 0.82, 0.525);
  coatBody.render();

  // NOSE
  var nose = new Cube();
  nose.color = [0.990, 0.499, 0.0396, 1.0]; // ORANGE
  nose.matrix.translate(-0.1, -0, -0.2);
  nose.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  nose.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  nose.matrix.scale(0.2, 0.1, 0.17);
  nose.render();

  // EYES

  let winkTranslateY = (g_blink || g_wink) ? 0.05 : 0;
  let winkTranslateZ = (g_blink || g_wink) ? -0.06 : -0.04;

  let leftEyeScaleY = (g_blink || g_wink) ? 0.02 : 0.15;

  var eye1 = new Cube();
  eye1.color = [0.0, 0.0, 0.0, 1.0]; // BLACK
  eye1.matrix.translate(-0.2499, winkTranslateY, winkTranslateZ);
  eye1.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  eye1.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  eye1.matrix.scale(0.15, leftEyeScaleY, 0.04);
  eye1.render();

  let rightEyeScaleY = g_blink ? 0.02 : 0.15;
  // move eye up so it blinks towards the center
  let winkTranslateRightY = g_blink ? 0.05 : 0;
  let winkTranslateRightZ = g_blink ? -0.06 : -0.04;

  var eye2 = new Cube();
  eye2.color = [0.0, 0.0, 0.0, 1.0];
  eye2.matrix.translate(0.0999, winkTranslateRightY, winkTranslateRightZ);
  eye2.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  eye2.matrix.rotate(g_headTilt, 0.0, 0.0, 1.0);
  eye2.matrix.scale(0.15, rightEyeScaleY, 0.04);
  eye2.render();


  // ARMS
  // LEFT ARM
  var armSegmentHeight = 0.15;
  var leftArmBase = new Matrix4();
  leftArmBase.setIdentity();

  // Position at shoulder
  leftArmBase.translate(0.25, -0.025, 0.025); // shoulder position
  leftArmBase.rotate(g_leftArmAngle, 1.0, 0.0, 0.0); // swing forwards/back

  // Segment 1
  var leftArm1 = new Cube();
  leftArm1.color = [0.161, 0.116, 0.170, 1.0]; // PURPLE/BLACK
  leftArm1.matrix.set(leftArmBase);
  leftArm1.matrix.translate(0, -armSegmentHeight/2, 0); // move center down to match pivot
  leftArm1.matrix.scale(0.1, armSegmentHeight, 0.3);
  leftArm1.render();

  // Segment 2
  var leftArm2 = new Cube();
  leftArm2.color = [0.161, 0.116, 0.170, 1.0]; // PURPLE/BLACK
  leftArm2.matrix.set(leftArmBase);
  leftArm2.matrix.translate(0, -armSegmentHeight*1.5, 0); // 1.5 segments down
  leftArm2.matrix.scale(0.1, armSegmentHeight, 0.3);
  leftArm2.render();

  // Segment 3
  var leftArm3 = new Cube();
  leftArm3.color = [0.161, 0.116, 0.170, 1.0]; // PURPLE/BLACK
  leftArm3.matrix.set(leftArmBase);
  leftArm3.matrix.translate(0, -armSegmentHeight*2.5, 0); // 2.5 segments down
  leftArm3.matrix.scale(0.1, armSegmentHeight, 0.3);
  leftArm3.render();

  // RIGHT ARM
  var armSegmentHeight = 0.15; // height of one segment
  var armSegmentWidth = 0.1;   // width of the arm
  var rightArmBase = new Matrix4();
  rightArmBase.setIdentity();

  // Position at shoulder
  rightArmBase.translate(-0.35, -0.025, 0.025);
  rightArmBase.rotate(g_rightArmAngle - 5, 1.0, 0.0, 0.0); // swing forwards/back

  // Segment 1
  var rightArm1 = new Cube();
  rightArm1.color = [0.161, 0.116, 0.170, 1.0]; // PURPLE/BLACK
  rightArm1.matrix.set(rightArmBase);
  rightArm1.matrix.translate(0, -armSegmentHeight/2, 0);
  rightArm1.matrix.scale(armSegmentWidth, armSegmentHeight, 0.3);
  rightArm1.render();

  // Segment 2
  var rightArm2 = new Cube();
  rightArm2.color = [0.161, 0.116, 0.170, 1.0]; // PURPLE/BLACK
  rightArm2.matrix.set(rightArmBase);
  rightArm2.matrix.translate(-0, -armSegmentHeight*1.5, 0); // next segment down
  rightArm2.matrix.scale(armSegmentWidth, armSegmentHeight, 0.3);
  rightArm2.render();

  // Segment 3
  var rightArm3 = new Cube();
  rightArm3.color = [0.161, 0.116, 0.170, 1.0]; // PURPLE/BLACK
  rightArm3.matrix.set(rightArmBase);
  rightArm3.matrix.translate(0, -armSegmentHeight*2.5, 0); // final segment down
  rightArm3.matrix.scale(armSegmentWidth, armSegmentHeight, 0.3);
  rightArm3.render();


  // LEG + FOOT PARAMETERS
  var legHeight = 0.275;
  var topY = -0.65; // top of leg
  var footHeight = 0.1; // foot cube height

  var legHeight = 0.275;
  var footHeight = 0.1;
  var topY = -0.65;

  // LEFT LEG
  var leg1 = new Cube();
  leg1.color = [0.990, 0.499, 0.0396, 1.0];
  leg1.matrix.setIdentity();
  leg1.matrix.translate(-0.185, legHeight, 0.1); //-0.185
  leg1.matrix.rotate(g_leftLegAngle, 1, 0, 0);
  leg1.matrix.rotate(-5, 1, 0, 0);
  leg1.matrix.translate(0, -legHeight + topY, 0);
  var leg1MatrixBeforeScale = new Matrix4(leg1.matrix);
  leg1.matrix.scale(0.15, legHeight, 0.2);
  leg1.render();

  // LEFT FOOT
  var foot1 = new Cube();
  foot1.color = [0.990, 0.499, 0.0396, 1.0];
  foot1.matrix.set(leg1MatrixBeforeScale);
  foot1.matrix.translate(-0.025, -legHeight + 0.225, 0.225);
  foot1.matrix.rotate(g_leftFootAngle, 1, 0, 0);
  foot1.matrix.scale(0.2, footHeight, -0.45);
  foot1.render();

  // RIGHT LEG
  var leg2 = new Cube();
  leg2.color = [0.990, 0.499, 0.0396, 1.0];
  leg2.matrix.setIdentity();
  leg2.matrix.translate(0.035, legHeight, 0.1); //0.035
  leg2.matrix.rotate(g_rightLegAngle, 1, 0, 0);
  leg2.matrix.rotate(-5, 1, 0, 0);
  leg2.matrix.translate(0, -legHeight + topY, 0);
  var leg2MatrixBeforeScale = new Matrix4(leg2.matrix);
  leg2.matrix.scale(0.15, legHeight, 0.2);
  leg2.render();

  // RIGHT FOOT
  var foot2 = new Cube();
  foot2.color = [0.990, 0.499, 0.0396, 1.0];
  foot2.matrix.set(leg2MatrixBeforeScale);
  foot2.matrix.translate(-0.025, -legHeight + 0.225, 0.225);
  foot2.matrix.rotate(g_rightFootAngle, 1, 0, 0);
  foot2.matrix.scale(0.2, footHeight, -0.45);
  foot2.render();

  // FISH
  
  // BODY
  let fishBody = new Cylinder();
  fishBody.color = [0.2, 0.6, 1.0, 1.0];
  fishBody.matrix.translate(0.52, -0.7, 0.25);
  fishBody.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  fishBody.matrix.rotate(g_fishFlop, 1.0, 0.0, 0.0);
  fishBody.matrix.scale(0.175, 0.165, 0.45);
  fishBody.render();

  // TAIL - LEFT FLAP
  let fishTailLeft = new Cube();
  fishTailLeft.color = [0.1, 0.4, 0.9, 1.0];
  fishTailLeft.matrix.translate(0.475, -0.6775, 0.3375);
  fishTailLeft.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  fishTailLeft.matrix.rotate(-25, 0, 1, 0);   // angle left
  fishTailLeft.matrix.rotate(-g_fishFlop, 1, 0, 0);
  fishTailLeft.matrix.rotate(g_fishFlop, 0, 1, 0);
  fishTailLeft.matrix.scale(0.12, 0.125, 0.225);
  fishTailLeft.render();

  // TAIL - RIGHT FLAP
  let fishTailRight = new Cube();
  fishTailRight.color = [0.1, 0.4, 0.9, 1.0];
  fishTailRight.matrix.translate(0.475, -0.6775, 0.375);
  fishTailRight.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  fishTailRight.matrix.rotate(25, 0, 1, 0);    // angle right
  fishTailRight.matrix.rotate(-g_fishFlop, 1, 0, 0);
  fishTailRight.matrix.rotate(-g_fishFlop, 0, 1, 0);
  fishTailRight.matrix.scale(0.12, 0.125, 0.225);
  fishTailRight.render();

  // let tailWag = 20 * Math.sin(g_seconds * 5);

  // fishTailLeft.matrix.rotate(-25 + tailWag, 0, 1, 0);
  // fishTailRight.matrix.rotate(25 - tailWag, 0, 1, 0);


  // FIN
  let fishFin = new Cube();
  fishFin.color = [0.15, 0.5, 0.9, 1.0];
  fishFin.matrix.translate(0.45, -0.7, 0.125);
  fishFin.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  fishFin.matrix.rotate(-35, 0, 1, 0.0);
  fishFin.matrix.rotate(g_fishFlop, 1, 0, 0);
  fishFin.matrix.rotate(g_fishFlop, 0, 0, 1);
  fishFin.matrix.scale(0.075, 0.15, 0.2);
  fishFin.render();

  // var foot1 = new Cube();
  // foot1.color = [0.990, 0.499, 0.0396, 1.0]; // ORANGE
  // foot1.matrix.translate(0.01, -0.7, -0.05);
  // foot1.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  // foot1.matrix.scale(0.2, 0.1, 0.415);
  // foot1.render();

  // var foot2 = new Cube();
  // foot2.color = [0.990, 0.499, 0.0396, 1.0]; // ORANGE
  // foot2.matrix.translate(-0.21, -0.7, -0.05);
  // foot2.matrix.rotate(-5.0, 1.0, 0.0, 0.0);
  // foot2.matrix.scale(0.2, 0.1, 0.415);
  // foot2.render();

  // Draw a left arm
  // var leftArm = new Cube();
  // leftArm.color = [1, 1, 0, 1];
  // leftArm.matrix.setTranslate(0.0, -0.5, 0.0);
  // leftArm.matrix.rotate(-5, 1, 0, 0);
  // leftArm.matrix.rotate(g_yellowAngle, 0.0, 0.0, 1.0);
  // var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
  // leftArm.matrix.scale(0.25, 0.7, 0.5);
  // leftArm.matrix.translate(-0.5, 0.0, 0.0)
  // leftArm.render();

  // // Test box
  // var box = new Cube();
  // box.color = [1.0, 0.0, 1.0, 1.0];
  // box.matrix = yellowCoordinatesMat;
  // box.matrix.translate(0, 0.7, 0);
  // box.matrix.rotate(g_magentaAngle, 0.0, 0.0, 1.0);
  // box.matrix.scale(0.3, 0.3, 0.3);
  // box.matrix.translate(-0.5, 0.0, -0.001);
  // box.render();

  // Check the time at the end of this funciton
  var duration = performance.now() - startTime;
  sendTextToHTML(" fps: " + Math.round(Math.floor(10000/duration)/10), "numdot");
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

function exportDrawing() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "drawing.png";
  link.click();
}