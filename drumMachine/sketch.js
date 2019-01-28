let recorder, soundFile, canvas;
let prevX, prevY;
let recordArray = [];
let state = 0; // mousePress will increment from Record, to Stop, to Play
let synth;
let replay = false;

function setup() {
  canvas = createCanvas(800, 800);
  background(255);
  fill(0);
  strokeWeight(100);
  text('Draw on the canvas to produce music', 20, 20);

  // create a sound recorder
  recorder = new p5.SoundRecorder();

  let producedAudio = new p5.AudioIn();
  producedAudio.setSource(0);

  synth = new p5.SinOsc();
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

  // Button to replay array
  button = createButton('Replay');
  button.position(10, 600);
  button.mousePressed(replayArray);

  function replayArray() {
    replay = true;
  }

  let play = document.createElement('button');
  play.innerText = 'Play';
  play.onclick = () => {
    function getSum(total, num) {
      return total + num;
    }

    let coloredPixels = [];
    for (let i = 0; i < 16; i++) {
      let pixels = canvas.drawingContext.getImageData(i * 50, 0, 50, 800);

      let j = 0;
      while (j < pixels.data.length) {
        if (pixels.data[j] < 255) {
          coloredPixels.push(j / 800);
        }
        j += 4;
      }
      // console.log('coloredPixels array is');
      // console.log(coloredPixels);
      if (coloredPixels.length) {
        let average = coloredPixels.reduce(getSum) / coloredPixels.length;
        console.log('average is ');
        console.log(average);
        synth.start();
        synth.fade(0.5, 0.2);
        synth.amp(2);
        synth.freq(midiToFreq((60 * average) / 500 + 30));
        setTimeout(10000);
      }
    }
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
}

function mousePressed() {
  if (state === 0 && !replay) {
    // Begin playing the synth
    synth.start();
    synth.fade(0.5, 0.2);
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
  synth.fade(0, 0.5);
  synth.stop();
  state = 0;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

function draw() {
  // Set previous mouse position correctly if starting a new line
  if (prevX === 0) {
    prevX = mouseX;
    prevY = mouseY;
  }

  if (state) {
    // Turn up volume of synthillator tone
    synth.amp(2);
    // Gives us a value between 30 and  80 (good audible frequencies)
    synth.freq(midiToFreq((60 * (1200 - mouseY)) / 500 + 30));

    // Start black stroke
    stroke(0);
    line(prevX, prevY, mouseX, mouseY);

    // Save all previous datapoints of mouse into a positional array //
    recordArray.push((prevX = mouseX));
    recordArray.push((prevY = mouseY));
    console.log(recordArray);
  }
  /*
----------------------------------------------------------

THIS IS THE RECORDING SNIPPET OF CODE -- BELOW --

This needs a bitton... toggle the value of < replay > with a button. If replay === true, p5 draw will run replay once and then set replay to false. Replay will replay back the values recorded in recordArray (see above)

----------------------------------------------------------
*/

  if (replay) {
    console.log('Replaying');
    console.log('RECORD ARRAY: ', recordArray);
    synth.start();
    for (let i = 0; i < recordArray.length - 4; i = i + 2) {
      console.log('X: ', recordArray[i], 'Y: ', recordArray[i + 1]);
      synth.amp(2);
      // Gives us a value between 30 and  80 (good audible frequencies)
      synth.freq(midiToFreq((60 * (1200 - recordArray[i + 1])) / 500 + 30));
      // Start black stroke
      stroke(0);
      line(
        recordArray[i],
        recordArray[i + 1],
        recordArray[i + 2],
        recordArray[i + 3]
      );

      // synth.fade(0.5, 0.2);
      sleep(15);
    }

    state = 0;
    console.log('DONE');
    replay = false;
  }

  /*
----------------------------------------------------------

THIS IS THE RECORDING SNIPPET OF CODE -- ABOVE --

----------------------------------------------------------
*/

  return recordArray;
}
