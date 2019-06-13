import Pitchfinder from "pitchfinder";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var analyser = null;
var mediaStreamSource = null;

let pitchDetect = function () {
    audioContext = new AudioContext();
}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect(analyser);
    updatePitch();
}

function toggleLiveInput() {
    getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googAutoGainControl": "false",
                    "googEchoCancellation": "false",
                    "googHighpassFilter": "false",
                    "googNoiseSuppression": "false",
                },
                "optional": []
            },
        }, gotStream);
}

var rafID = null;
var buflen = 1024;
var buf = new Float32Array(buflen);


function updatePitch() {
    var cycles = new Array;
    analyser.getFloatTimeDomainData(buf);

    const detectPitch = new Pitchfinder.AMDF();

    const pitch = detectPitch(buf);
    pitchCallback(pitch)

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    rafID = window.requestAnimationFrame(updatePitch); // this is needed
}

var pitchCallback
function setPitchCallback(cb) {
    pitchCallback = cb
}

export { pitchDetect, toggleLiveInput, setPitchCallback }