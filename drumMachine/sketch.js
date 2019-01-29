let recorder, soundFile, canvas;
let prevX, prevY;
let state = 0; // mousePress will increment from Record, to Stop, to Play
let synth, synth2;
let replay = false;
let color = 'black';

const notes = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83];
let recordArray = [];
let playbackArray = [];
let recordArrayRed = [];
let recordArrayBlack = [];

function setup() {
  canvas = createCanvas(800, 800);
  background(255);
  fill(0);
  strokeWeight(50);
  
  // create a sound recorder
  recorder = new p5.SoundRecorder();
  let producedAudio = new p5.AudioIn();
  producedAudio.setSource(0);

  synth = new p5.SinOsc();
  synth2 = new p5.Oscillator();
  synth2.setType('sawtooth');
  recorder.setInput(synth);
  // create an empty sound file that we will use to playback the recording
  soundFile = new p5.SoundFile();
  // Button to begin recording audio
  let startRecording = document.createElement('button');
  startRecording.innerText = 'Start Recording';
  startRecording.onclick = () => {
    recorder.record(soundFile);
  };
  document.body.appendChild(startRecording);
  // Button to stop recording audio
  let stopRecording = document.createElement('button');
  stopRecording.innerText = 'Stop Recording';
  stopRecording.onclick = () => {
    recorder.stop();
  };
  document.body.appendChild(stopRecording);
  let redPaint = document.createElement('button');
  redPaint.innerText = 'Red';
  redPaint.onclick = () => {
    color = 'red';
  };
  document.body.appendChild(redPaint);
  let blackPaint = document.createElement('button');
  blackPaint.innerText = 'Black';
  blackPaint.onclick = () => {
    color = 'black';
  };
  document.body.appendChild(blackPaint);
  let play = document.createElement('button');
  play.innerText = 'Play';
  play.onclick = () => {
    function getSum(total, num) {
      return total + num;
    }
    let blackPixels = [];
    let redPixels = [];
    synth.start();
    synth2.start();
    synth.amp(0);
    synth2.amp(0);
    for (let i = 0; i < 200; i++) {
      let pixels = canvas.drawingContext.getImageData(i * 4, 0, 50, 800);
      let j = 0;
      while (j < pixels.data.length) {
        if (pixels.data[j] === 0 && pixels.data[j + 1] === 0) {
          blackPixels.push(j / 200);
        } else if (pixels.data[j] === 255 && pixels.data[j + 1] === 0) {
          redPixels.push(j / 200);
        }
        j += 4;
      }
      if(blackPixels.length) {
        let averageBlack = blackPixels.reduce(getSum)/blackPixels.length;

        let frequency = (((60 * averageBlack)/500));
        let index = Math.floor(14 - (21 * frequency) / 125);

        sleep(20);
        synth.freq(midiToFreq(notes[index]));
        synth.amp(2);
      }
      if(redPixels.length){
        let averageRed = redPixels.reduce(getSum)/redPixels.length;

        let frequency = (((60 * averageRed)/500));
        let index = Math.floor(14 - (21 * frequency) / 125);

        console.log('about to emit red frequency ' + frequency);
        console.log('index is ' + index)
        sleep(20);
        synth2.freq(midiToFreq(notes[index]));
        synth2.amp(2)
      }
      blackPixels = [];
      redPixels = [];
    }
    synth.stop();
    synth2.stop();
  };
  document.body.appendChild(play);
  // Button to download the currently recorded audio
  let download = document.createElement('button');
  download.innerText = 'Download';
  download.onclick = () => {
    saveSound(soundFile, 'myHorribleSound.wav');
    // Re-initialize the soundfile
    soundFile = new p5.SoundFile();
    // Retrieve all pixels from the canvas
  };
  document.body.appendChild(download);
  let playback = document.createElement('button');
  playback.innerText = 'Playback';
  playback.onclick = () => {
    replay = true;
  };
  document.body.appendChild(playback);
}

function mousePressed() {
  if (state === 0 && mouseX <= 800 && mouseY <= 800) {
    // Begin playing the synth
    if (color === 'black') {
      synth.start();
    } else if (color === 'red') {
      synth2.start();
    }
    state++;
    // Reset the previous mouse position
    prevX = 0;
    prevY = 0;
  } else {
    state = 0;
  }
}
function mouseReleased() {
  // Stop playing synth
  if (color === 'black') {
    synth.fade(0, 0.5);
    synth.stop();
  } else if (color === 'red') {
    synth2.fade(0, 0.5);
    synth2.stop();
  }

  state = 0;
}
function draw() {
  // Set previous mouse position correctly if starting a new line
  if (prevX === 0) {
    prevX = mouseX;
    prevY = mouseY;
  }

  if (state) {
    // Turn up volume of synthillator tone
    // Gives us a value between 30 and  80 (good audible frequencies)
    if (mouseX <= 800 && mouseY <= 800) {
      // Start black stroke
      if (color === 'black') {
        synth.amp(2);
        synth.freq(midiToFreq((((60 * (800 - mouseY))/500))));
        stroke(0);
        recordArrayBlack.push(mouseX);
        recordArrayBlack.push(mouseY);
      } else if (color === 'red') {
        synth2.amp(2);
        synth2.freq(midiToFreq((((60 * (800 - mouseY))/500))));
        stroke(255, 0, 0);
        recordArrayRed.push(mouseX);
        recordArrayRed.push(mouseY);
      }
      line(prevX, prevY, mouseX, mouseY);
    }
    // Save previous mouse position for next line() call
    prevX = mouseX;
    prevY = mouseY;
    console.log('Current array black: ', recordArrayBlack);
    console.log('Current array red: ', recordArrayRed);
  }

  /*
----------------------------------------------------------
THIS IS THE RECORDING SNIPPET OF CODE -- BELOW --
This needs a bitton... toggle the value of < replay > with a button. If replay === true, p5 draw will run replay once and then set replay to false. Replay will replay back the values recorded in recordArray (see above)
----------------------------------------------------------
*/

  if (replay) {
    console.log('Replaying');
    synth.start();
    if (color === 'red') {
      playbackArray = recordArrayRed;
    }
    if (color === 'black') {
      playbackArray = recordArrayBlack;
    }
    for (let i = 0; i < playbackArray.length - 4; i = i + 2) {
      synth.amp(2);
      // Gives us a value between 30 and  80 (good audible frequencies)
      synth.freq(midiToFreq((60 * (800 - playbackArray[i + 1])) / 500 + 30));
      // Start black stroke
      stroke(0);
      console.log(color);
      line(
        playbackArray[i],
        playbackArray[i + 1],
        playbackArray[i + 2],
        playbackArray[i + 3]
      );

      sleep(17);
    }

    mouseReleased();
    state = 0;
    console.log('DONE');
    replay = false;
  }

  /*
----------------------------------------------------------
THIS IS THE RECORDING SNIPPET OF CODE -- ABOVE --
----------------------------------------------------------
*/
}
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}
