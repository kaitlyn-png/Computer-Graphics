// ColoredPoints.js
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
let canvas, gl, a_Position, u_FragColor, u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// CONSTANTS
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables RELATED TO UI
let g_selectedColor = [1.0, 0, 0, 1.0]; // Default color is red
let g_selectedSize = 5.0; // Default size
let g_selectedType = POINT; // Default shape type
let g_selectedSegments = 10; // Default segments for circle
let g_rotateTriangle = 0; // Default no rotation

// Displaying Modifications
let rotateOn = false;
let SegmentOn = false;

// Function to update visibility of sliders
function updateSliderVisibility() {
  document.getElementById('rotateContainer').style.display = rotateOn ? 'block' : 'none';
  document.getElementById('segmentsContainer').style.display = SegmentOn ? 'block' : 'none';
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); document.getElementById('catImage').style.display = 'none'; };
   document.getElementById("exportButton").addEventListener("click", () => { exportDrawing(); });
   document.getElementById("generateButton").addEventListener("click", () => { generate(); });

  document.getElementById('pointButton').onclick = function() {g_selectedType=POINT; rotateOn = false; SegmentOn = false; updateSliderVisibility()}; 
  document.getElementById('triangleButton').onclick = function() {g_selectedType=TRIANGLE; rotateOn = true; SegmentOn = false; updateSliderVisibility()};
  document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE; rotateOn = false; SegmentOn = true; updateSliderVisibility()};
  
  // Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function(event) { g_selectedSize = event.target.value; });

  document.getElementById('redSlide').addEventListener('mouseup', function(event) { g_selectedColor[0] = event.target.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function(event) { g_selectedColor[1] = event.target.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function(event) { g_selectedColor[2] = event.target.value/100; });
  document.getElementById('alphaSlide').addEventListener('mouseup', function(event) { g_selectedColor[3] = event.target.value/100; });

  document.getElementById('segmentsSlide').addEventListener('mouseup', function(event) { g_selectedSegments = event.target.value; });

  document.getElementById('rotateSlide').addEventListener('mouseup', function(event) { g_rotateTriangle = event.target.value; });
}

// Main Function
function main() {

  // Set up Canvas and WebGL context
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Initialize slider visibility
  updateSliderVisibility();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev){ if(ev.buttons==1) click(ev); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = []; // List of shapes in the canvas

function click(ev) {

  // Exract the event click and return it in WebGL coordinates
  [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store a new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
    point.rotate = g_rotateTriangle;
  } else {
    point = new Circle();
    point.segments = g_selectedSegments;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  //Draw every shape that is suppose to be in the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function renderAllShapes(){
  
  // Check the time at the start of this funciton
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at the end of this funciton
  // var duration = performance.now() - startTime;
  // sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
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