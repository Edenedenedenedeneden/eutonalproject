let backgroundImg, img2024, arrowImg;
let otherTextImgs = [];
let otherTextSongs = [];
let currentImgIndex = 0;
let rect1X = 833;
let rect1Y = 62;
let rect2X = 1063;
let rect2Y = 62;
let rectSizeW = 23; // Updated width
let rectSizeH = 35; // Updated height
let startRectX = 204;
let startRectY = 505;
let startRectW = 47;
let startRectH = 52;
let currentSong;
let allLoaded = false;
let started = false;
let screenFilled = false; // To track if the screen is filled for the first time
let arrowDisplayed = false; // To track if the arrow has been displayed
let amp;

let rectSizeFill = 45;
let totalRects;
let startTime;
let lastRectTime = 0;
let currentRectIndex = 0;
let rectColors = []; // Array to store colors of the squares
let arrowBlinkTime = 0; // To track time for arrow blinking

function preload() {
  // Load images
  backgroundImg = loadImage('bakground no grain.png', checkIfAllLoaded);
  img2024 = loadImage('2024.png', checkIfAllLoaded);
  arrowImg = loadImage('arrow.png', checkIfAllLoaded);
  otherTextImgs.push(loadImage('other text.png', checkIfAllLoaded));
  otherTextImgs.push(loadImage('other text sunset.png', checkIfAllLoaded));
  otherTextImgs.push(loadImage('other text sunrise.png', checkIfAllLoaded));

  // Load songs with loaded callback
  otherTextSongs.push(loadSound('hot sunny days.mp3', checkIfAllLoaded));
  otherTextSongs.push(loadSound('sunset.mp3', checkIfAllLoaded));
  otherTextSongs.push(loadSound('sunrise.mp3', checkIfAllLoaded));
}

function setup() {
  createCanvas(1920, 1080);
  textAlign(CENTER, CENTER);
  amp = new p5.Amplitude();

  // Calculate the total number of rectangles needed to fill the screen
  totalRects = Math.ceil(width / rectSizeFill) * Math.ceil(height / rectSizeFill);
  
  // Initialize the rectColors array with null values
  for (let i = 0; i < totalRects; i++) {
    rectColors.push(null);
  }
}

function draw() {
  if (allLoaded) {
    // Display background image
    image(backgroundImg, 0, 0);

    // Draw purple rectangles
    drawRectangles('#6B10C5');

    // Display the '2024.png' image
    image(img2024, 50, 440);

    // Display the initial purple rectangle to start actions behind green rectangles
    if (!started) {
      fill('#690AC7');
      noStroke();
      rect(startRectX, startRectY, startRectW, startRectH);
    }

    // Draw green rectangles
    drawRectangles('#2BB516');

    // Display the clickable purple rectangles behind 'other text' layer
    fill('#690AC7');
    noStroke();
    rect(rect1X, rect1Y, rectSizeW, rectSizeH);
    rect(rect2X, rect2Y, rectSizeW, rectSizeH);

    // Display the current 'other text' image
    image(otherTextImgs[currentImgIndex], 50, 60);

    // Check if the screen is filled
    if (currentRectIndex >= totalRects) {
      if (!arrowDisplayed) {
        screenFilled = true; // Set the screen filled status for the first time
        arrowDisplayed = true; // Ensure the arrow is only displayed once
        arrowBlinkTime = millis(); // Initialize blinking time
      }
      currentRectIndex = 0; // Reset the index to start replacing squares
    }

    // Display the arrow if the screen was filled for the first time
    if (arrowDisplayed) {
      blinkArrow();
    }
  } else {
    background(255);
    fill(0);
    textSize(32);
    text('Loading...', width / 2, height / 2);
  }
}

function drawRectangles(colorFilter) {
  if (started) {
    // Calculate the elapsed time since the song started
    let elapsedTime = millis() - startTime;

    // Check if it's time to draw the next rectangle
    if (elapsedTime - lastRectTime > 42) { // Adjusted this value for faster drawing
      lastRectTime = elapsedTime;
      if (currentRectIndex < totalRects) {
        // Analyze the volume to determine color
        let level = amp.getLevel();
        let color;
        if (random() < 0.5) { // 50% chance to be purple regardless of volume
          color = '#6B10C5';
        } else if (random() < 0.3) { // 30% chance to be green regardless of volume
          color = '#2BB516';
        } else {
          color = level > 0.1 ? '#2BB516' : '#6B10C5'; // Adjust the threshold for sensitivity
        }

        // Update the color in the array
        rectColors[currentRectIndex] = color;

        // Move to the next rectangle
        currentRectIndex++;
      }
    }

    // Redraw all rectangles of the specified color
    for (let i = 0; i < totalRects; i++) {
      if (rectColors[i] === colorFilter) {
        let x = (i % Math.ceil(width / rectSizeFill)) * rectSizeFill;
        let y = Math.floor(i / Math.ceil(width / rectSizeFill)) * rectSizeFill;
        fill(rectColors[i]);
        rect(x, y, rectSizeFill, rectSizeFill);
      }
    }
  }
}

function mousePressed() {
  if (allLoaded) {
    // Check if the initial start rectangle is clicked
    if (!started && mouseX > startRectX && mouseX < startRectX + startRectW && mouseY > startRectY && mouseY < startRectY + startRectH) {
      started = true;
      startTime = millis();
      lastRectTime = 0;
      currentRectIndex = 0;
      resetRectColors();
      console.log("Start rectangle clicked! Actions started.");
      changeImage(currentImgIndex); // Start with the current image and song
    }

    if (started) {
      // Check if the mouse is within the bounds of the left rectangle
      if (mouseX > rect1X && mouseX < rect1X + rectSizeW && mouseY > rect1Y && mouseY < rect1Y + rectSizeH) {
        // Change to the next image in the array (cycling forward)
        changeImage((currentImgIndex + 1) % otherTextImgs.length);
        console.log("Left rectangle clicked! Changed to the next image.");
      }

      // Check if the mouse is within the bounds of the right rectangle
      if (mouseX > rect2X && mouseX < rect2X + rectSizeW && mouseY > rect2Y && mouseY < rect2Y + rectSizeH) {
        // Change to the previous image in the array (cycling backward)
        changeImage((currentImgIndex - 1 + otherTextImgs.length) % otherTextImgs.length);
        console.log("Right rectangle clicked! Changed to the previous image.");
      }
    }
  }
}

function changeImage(newIndex) {
  if (currentSong) {
    currentSong.stop();
  }
  currentImgIndex = newIndex;
  resetDrawing();
  currentSong = otherTextSongs[currentImgIndex];
  currentSong.loop();
  // Reset the drawing process when a new song starts
  resetDrawing();
}

function resetDrawing() {
  startTime = millis();
  lastRectTime = 0;
  currentRectIndex = 0;
  resetRectColors();
  screenFilled = false; // Reset the screen filled status
  arrowDisplayed = false; // Reset the arrow displayed status
}

function resetRectColors() {
  for (let i = 0; i < totalRects; i++) {
    rectColors[i] = null;
  }
}

function blinkArrow() {
  let blinkInterval = 1000; // Blinking interval in milliseconds
  let currentTime = millis();

  // Calculate the alpha value based on the blink interval
  let alpha = map(sin(TWO_PI * (currentTime - arrowBlinkTime) / blinkInterval), -1, 1, 50, 255);

  // Display the arrow image with the calculated alpha value
  tint(255, alpha);
  image(arrowImg, 1502, 594);
  noTint();
}

let loadCount = 0;
function checkIfAllLoaded() {
  loadCount++;
  if (loadCount === otherTextImgs.length + otherTextSongs.length + 3) { // +3 for the background, '2024' and 'arrow' images
    allLoaded = true;
  }
}