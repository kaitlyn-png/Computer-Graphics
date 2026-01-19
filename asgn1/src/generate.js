
function generate() {
  // Clear existing shapes
  g_shapesList = [];
  renderAllShapes();

  // Left Ear

  let leftEar = new Triangle();
  leftEar.position = [-0.16, 0.4];
  leftEar.size = 40;
  leftEar.color = [0.82, 0.82, 0.82, 1.0];
  leftEar.rotate = 0;
  g_shapesList.push(leftEar);

  let rightEar = new Triangle();
  rightEar.position = [0.15, 0.4];
  rightEar.size = 40;
  rightEar.color = [1.0, 0.65, 0.0, 1.0];
  rightEar.rotate = 90;
  g_shapesList.push(rightEar);

  // Collar

  let collar = new Triangle();
  collar.position = [-0.15, 0.3];
  collar.size = 60;
  collar.color = [1.0, 0.0, 0.0, 1.0];
  collar.rotate = 270;
  g_shapesList.push(collar);

  let collar2 = new Triangle();
  collar2.position = [0.15, 0];
  collar2.size = 60;
  collar2.color = [1.0, 0.0, 0.0, 1.0];
  collar2.rotate = 90;
  g_shapesList.push(collar2);

  // Head

  let head = new Triangle();
  head.position = [-0.2, 0.5];
  head.size = 80;
  head.color = [1.0, 1.0, 1.0, 1.0];
  head.rotate = 270;
  g_shapesList.push(head);

  let head2 = new Triangle();
  head2.position = [0.2, 0.1];
  head2.size = 80;
  head2.color = [1.0, 1.0, 1.0, 1.0];
  head2.rotate = 90;
  g_shapesList.push(head2);

  // Back Feet

  let leftbackFoot = new Triangle();
  leftbackFoot.position = [-0.075, -0.45];
  leftbackFoot.size = 20;
  leftbackFoot.color = [0.95, 0.95, 0.95, 1.0];
  leftbackFoot.rotate = 90;
  g_shapesList.push(leftbackFoot);


  let leftbackFoot2 = new Triangle();
  leftbackFoot2.position = [-0.075, -0.45];
  leftbackFoot2.size = 20;
  leftbackFoot2.color = [0.95, 0.95, 0.95, 1.0];
  leftbackFoot2.rotate = 0;
  g_shapesList.push(leftbackFoot2);

  let rightbackFoot = new Triangle();
  rightbackFoot.position = [0.075, -0.45];
  rightbackFoot.size = 20;
  rightbackFoot.color = [0.95, 0.95, 0.95, 1.0];
  rightbackFoot.rotate = 90;
  g_shapesList.push(rightbackFoot);

  let rightbackFoot2 = new Triangle();
  rightbackFoot2.position = [0.075, -0.45];
  rightbackFoot2.size = 20;
  rightbackFoot2.color = [0.95, 0.95, 0.95, 1.0];
  rightbackFoot2.rotate = 0;
  g_shapesList.push(rightbackFoot2);

  // Body

  let body1 = new Triangle();
  body1.position = [-0.15, 0];
  body1.size = 60;
  body1.color = [1.0, 1.0, 1.0, 1.0];
  body1.rotate = 270;
  g_shapesList.push(body1);

  let body2 = new Triangle();
  body2.position = [0.15, -0.3];
  body2.size = 60;
  body2.color = [1.0, 1.0, 1.0, 1.0];
  body2.rotate = 90;
  g_shapesList.push(body2);

  let body3 = new Triangle();
  body3.position = [-0.15, -0.2];
  body3.size = 60;
  body3.color = [1.0, 1.0, 1.0, 1.0];
  body3.rotate = 270;
  g_shapesList.push(body3);

  let body4 = new Triangle();
  body4.position = [0.15, -0.5];
  body4.size = 60;
  body4.color = [1.0, 1.0, 1.0, 1.0];
  body4.rotate = 90;
  g_shapesList.push(body4);

  // Feet

  let leftFoot = new Triangle();
  leftFoot.position = [-0.1, -0.5];
  leftFoot.size = 20;
  leftFoot.color = [0.95, 0.95, 0.95, 1.0];
  leftFoot.rotate = 90;
  g_shapesList.push(leftFoot);

  let leftFoot2 = new Triangle();
  leftFoot2.position = [-0.1, -0.5];
  leftFoot2.size = 20;
  leftFoot2.color = [0.95, 0.95, 0.95, 1.0];
  leftFoot2.rotate = 0;
  g_shapesList.push(leftFoot2);

  let rightFoot = new Triangle();
  rightFoot.position = [0.1, -0.5];
  rightFoot.size = 20;
  rightFoot.color = [0.95, 0.95, 0.95, 1.0];
  rightFoot.rotate = 90;
  g_shapesList.push(rightFoot);

  let rightFoot2 = new Triangle();
  rightFoot2.position = [0.1, -0.5];
  rightFoot2.size = 20;
  rightFoot2.color = [0.95, 0.95, 0.95, 1.0];
  rightFoot2.rotate = 0;
  g_shapesList.push(rightFoot2);

  for (var i = 0; i < 400; i++) {
    let scale = i / 1000.0;
    let tri = new Triangle();
    tri.position = [-0.02, -0.5 + scale, -0.02, -0.5 + scale, -0.02, -0.275];
    tri.size = 5;
    tri.color = [0, 0, 0, 1.0];
    tri.rotate = 0;
    g_shapesList.push(tri);
  }
  
  // NOSE
  let nose = new Triangle();
  nose.position = [-0.005, 0.26];
  nose.size = 10;
  nose.color = [1.0, 0.7137, 0.7568, 1.0];
  nose.rotate = 45;
  g_shapesList.push(nose);

  // EYES
  let leftEye = new Triangle();
  leftEye.position = [-0.07, 0.3];
  leftEye.size = 8;
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.rotate = 45;
  g_shapesList.push(leftEye);

  let rightEye = new Triangle();
  rightEye.position = [0.07, 0.3];
  rightEye.size = 8;
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.rotate = 45;
  g_shapesList.push(rightEye);

  // Initials
  
  // // Draw a line upwards
  // for (var i = 0; i < 100; i++) {
  //   let scale = i / 1000.0;
  //   let tri = new Triangle();
  //   tri.size = 5;
  //   let d = this.size/200.0;
  //   tri.position = [-0.1, -0.7 + scale, -0.1 - d, -0.7 + scale, -0.1, -0.7 - d];
  //   tri.color = [1, 1, 1, 1.0];
  //   tri.rotate = 0;
  //   g_shapesList.push(tri);
  // }

  // // Draw a diagonal line to the right
  // for (var i = 0; i < 100; i++) {
  //   let scale = i / 1000.0;
  //   let tri = new Triangle();
  //   tri.size = 5;
  //   let d = this.size/200.0;
  //   tri.position = [-0.1 + scale, -0.6 + scale, -0.1 + scale - d, -0.6 + scale, -0.1 + scale, -0.6 + scale - d];
  //   tri.color = [1, 1, 1, 1.0];
  //   tri.rotate = 0;
  //   g_shapesList.push(tri);
  // }

  // // Draw a diagonal line to the left
  // for (var i = 0; i < 100; i++) {
  //   let scale = i / 1000.0;
  //   let tri = new Triangle();
  //   tri.size = 5;
  //   let d = this.size/200.0;
  //   tri.position = [0.0 - scale, -0.6 + scale, 0.0 - scale - d, -0.6 + scale, 0.0 - scale, -0.6 + scale - d];
  //   tri.color = [1, 1, 1, 1.0];
  //   tri.rotate = 0;
  //   g_shapesList.push(tri);
  // }

  
  renderAllShapes();
  
  // Show the cat image
  document.getElementById('catImage').style.display = 'block';
}