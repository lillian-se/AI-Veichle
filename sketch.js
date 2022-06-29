// https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html

// This is an implementation of Nordic Semicondutor's UART/Serial Port Emulation over Bluetooth low energy
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

// This characteristic allows the micro:bit to transmit a byte array containing an
// arbitrary number of arbitrary octet values to a connected device.
const UART_TX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

// This characteristic allows a connected client to send a byte array containing an
// arbitrary number of arbitrary octet values to a connected micro:bit.
const UART_RX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

let uBitDevice;
let rxCharacteristic;

// Variables for AI
let classifier;
let label;
let confidence;
let words;
let num;

const options = {
  probabilityThreshold: 0.95,
};

function preload() {
  // Load SpeechCommands18w sound classifier model ml5.js
  classifier = ml5.soundClassifier("SpeechCommands18w", options);
}

function setup() {
  noCanvas();
  // Create buttons to connect/disconnect device to micro:bit
  const connectButton = createButton("Connect");
  connectButton.mousePressed(connectButtonPressed);

  const disconnectButton = createButton("Disconnect");
  disconnectButton.mousePressed(disconnectButtonPressed);

  // Create 'label' and 'confidence' div to hold results
  label = createDiv("Label: ...");
  confidence = createDiv("Confidence: ...");

  // List of words to use. "down" is used to make vehicle move in reverse
  words = createDiv('Commands:  “go”, "down", “stop”, "left", "right"');
  // Classify the sound from microphone in real time
  classifier.classify(gotResult);
}

// What to do when getting results from speech
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  // Show the first label and confidence
  label.html("Label: " + results[0].label);

  if (results[0].label == "go") {
    gotLabel("0");
  } else if (results[0].label == "down") {
    gotLabel("1");
  } else if (results[0].label == "stop") {
    gotLabel("2");
  } else if (results[0].label == "left") {
    gotLabel("3");
  } else if (results[0].label == "right") {
    gotLabel("4");
  }
  // Format confidence number to string and output on screen
  confidence.html("Confidence: " + nf(results[0].confidence, 0, 2));
}

// Connect computer and Micro:bit over Bluetooth
async function connectButtonPressed() {
  try {
    console.log("Requesting Bluetooth Device...");
    uBitDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [UART_SERVICE_UUID],
    });

    console.log("Connecting to GATT Server...");
    const server = await uBitDevice.gatt.connect();

    console.log("Getting Service...");
    const service = await server.getPrimaryService(UART_SERVICE_UUID);

    console.log("Getting Characteristics...");
    const txCharacteristic = await service.getCharacteristic(
      UART_TX_CHARACTERISTIC_UUID
    );
    txCharacteristic.startNotifications();
    txCharacteristic.addEventListener(
      "characteristicvaluechanged",
      onTxCharacteristicValueChanged
    );
    rxCharacteristic = await service.getCharacteristic(
      UART_RX_CHARACTERISTIC_UUID
    );
  } catch (error) {
    console.log(error);
  }
}

// Disconnect computer and Micro:bit
function disconnectButtonPressed() {
  if (!uBitDevice) {
    return;
  }

  if (uBitDevice.gatt.connected) {
    uBitDevice.gatt.disconnect();
    console.log("Disconnected");
  }
}

// Function for sending label number as string to Micro:bit
async function gotLabel(num) {
  if (!rxCharacteristic) {
    return;
  }
  if (num == "0") {
    try {
      let encoder = new TextEncoder();
      rxCharacteristic.writeValue(encoder.encode("0\n"));
    } catch (error) {
      console.log(error);
    }
  } else if (num == "1") {
    try {
      let encoder = new TextEncoder();
      rxCharacteristic.writeValue(encoder.encode("1\n"));
    } catch (error) {
      console.log(error);
    }
  } else if (num == "2") {
    try {
      let encoder = new TextEncoder();
      rxCharacteristic.writeValue(encoder.encode("2\n"));
    } catch (error) {
      console.log(error);
    }
  } else if (num == "3") {
    try {
      let encoder = new TextEncoder();
      rxCharacteristic.writeValue(encoder.encode("3\n"));
    } catch (error) {
      console.log(error);
    }
  } else if (num == "4") {
    try {
      let encoder = new TextEncoder();
      rxCharacteristic.writeValue(encoder.encode("4\n"));
    } catch (error) {
      console.log(error);
    }
  }
}

// if values are sent from Micro:bit to computer
function onTxCharacteristicValueChanged(event) {
  let receivedData = [];
  for (let i = 0; i < event.target.value.byteLength; i++) {
    receivedData[i] = event.target.value.getUint8(i);
  }
}
