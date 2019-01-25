/*jshint esversion: 6 */

let hh, clap, bass; // INSTRUMENT. will serve as a container that holds a sound source
let hPat, cPat, bPat; // INSTRUMENT PATTERN. it will be an array of numbers that we can manipulate
let hPhrase, cPhrase, bPhrase; // INSTRUMENT PHRASE. defines how the instrument pattern is interpreted
let drums; // PART. we will attach the phrase to the part, which will serve as transport to drive phrase
let bpmCTRL;
let beatLength;
let cellWidth;
let cnv;
let sPat;

function setup() {
  cnv = createCanvas(320, 60);
  cnv.mousePressed(canvasPressed);

  beatLength = 16;
  cellWidth = width / beatLength;

  hh = loadSound('drumSamples/hh_sample.mp3', () => {});
  clap = loadSound('drumSamples/clap_sample.mp3', () => {});
  bass = loadSound('drumSamples/bass_sample.mp3', () => {});

  hPat = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  cPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  bPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  sPat = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  hPhrase = new p5.Phrase('hh', (time) => {
    hh.play(time);
  }, hPat);
  cPhrase = new p5.Phrase('clap', (time) => {
    clap.play(time);
  }, cPat);
  bPhrase = new p5.Phrase('bass', (time) => {
    bass.play(time);
  }, bPat);

  drums = new p5.Part();

  drums.addPhrase(hPhrase);
  drums.addPhrase(cPhrase);
  drums.addPhrase(bPhrase);
  drums.addPhrase('seq', sequence, sPat);

  bpmCTRL = createSlider(30, 200, 80, 1);
  bpmCTRL.position(10, 70);
  bpmCTRL.input(() => {
    drums.setBPM(bpmCTRL.value());
  });
  drums.setBPM('80');

  drawMatrix();
}

function keyPressed() {
  if (key === " ") {
    if (hh.isLoaded() && clap.isLoaded() && bass.isLoaded()) {
      if (!drums.isPlaying) {
        drums.metro.metroTicks = 0; // restarts playhead at beginning [0]
        drums.loop();
      } else {
        drums.stop();
      }
    }
  }
}

function canvasPressed() {
  let rowClicked = floor(3 * mouseY / height);
  let indexClicked = floor(16 * mouseX / width);
  if (rowClicked === 0) {
    hPat[indexClicked] = invert(hPat[indexClicked]);
  } else if (rowClicked === 1) {
    cPat[indexClicked] = invert(cPat[indexClicked]);
  } else if (rowClicked === 2) {
    bPat[indexClicked] = invert(bPat[indexClicked]);
  }

  drawMatrix();
}

function drawMatrix() {
  background('orange');
  stroke('white');
  strokeWeight(2.25);
  fill('black');
  for (let i = 0; i < beatLength + 1; i++) {
    // startx, starty, endx, endy
    line(i * cellWidth, 0, i * cellWidth, height);
  }

  for (let i = 0; i < 4; i++) {
    line(0, i * height / 3, width, i * height / 3);
  }

  noStroke();

  for (let i = 0; i < beatLength; i++) {
    if (hPat[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, height / 6, 10);
    }
    if (cPat[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, height / 2, 10);
    }
    if (bPat[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, height * 5 / 6, 10);
    }
  }
}

function invert(bitInput) {
  return bitInput ? 0 : 1;
}

function sequence(time, beatIndex) {
  setTimeout(() => { // syncs up the timing so the beats and the playhead are in sync
    drawMatrix();
    drawPlayhead(beatIndex);
  }, time * 1000);
}

function drawPlayhead(beatIndex) {
  stroke('blue');
  fill(255, 0, 0, 20);
  rect((beatIndex - 1) * cellWidth, 0, cellWidth, height);
}