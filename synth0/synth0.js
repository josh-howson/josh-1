let playing = true
const SMOOTHING = 0.03
const Q_MULTIPLIER = 30
const MIN_FREQUENCY = 20

// query selectors
const frequency = document.querySelector('#oscillatorFrequency')
const cutoff = document.querySelector('#filterCutoff')
const oscillatorType = document.querySelector('#oscillatorType')
const q = document.querySelector('#filterResonance')
const outputLevel = document.querySelector('#outputLevel')
const distortionToggle = document.querySelector('#distortionToggle')
const distortionAmount = document.querySelector('#distortionAmount')
const distortionVisualizer = document.querySelector('#distortionVisualizer')

// audio context
const audioCtx = new AudioContext()

// create chain of nodes to connect
const nodes = []

/**
 * Utility to get the frequency value in Hz from a value in percent.
 * 
 * @param {Number} valueInPercent a number from 0 to 100
 * @returns the frequency value in Hz
 */
const getFrequencyValue = (valueInPercent) => {
  // from: https://webaudioapi.com/samples/filter/filter-sample.js
  // Clamp the frequency between the minimum value (MIN_FREQUENCY Hz) and half of the
  // convert from a value between 0 and 100 to a value between 0 and 1
  const percent = valueInPercent / 100
  // sampling rate.
  const minValue = MIN_FREQUENCY
  const maxValue = audioCtx.sampleRate / 2
  // Logarithm (base 2) to compute how many octaves fall in the range.
  const numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  const multiplier = Math.pow(2, numberOfOctaves * (percent - 1.0))
  // Get back to the frequency value between min and max.
  return maxValue * multiplier
}

// oscillator
const oscillatorNode = audioCtx.createOscillator()
// nodes.(oscillatorNode)
addNode(oscillatorNode)

// filter
const filterNode = audioCtx.createBiquadFilter()
filterNode.type = 'lowpass'
// nodes.push(filterNode)
addNode(filterNode)

// post filter distortion
const distortionNode = audioCtx.createWaveShaper()
// from https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper
function makeDistortionCurve(amount) {
  const k = typeof amount === "number" ? amount : 50
  const n_samples = audioCtx.sampleRate
  const curve = new Float32Array(n_samples)
  const deg = Math.PI / 180

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
  }
  return curve
}

// distortionNode.curve = makeDistortionCurve(100)
distortionNode.oversample = "4x"
// nodes.push(distortionNode)
addNode(distortionNode)

// mute
const muteNode = audioCtx.createGain()
// nodes.push(muteNode)
addNode(muteNode)

// output level
const outputNode = audioCtx.createGain()
// nodes.push(outputNode)
addNode(outputNode)

// start button
document.querySelector('#start').addEventListener('click', e => {
  oscillatorNode.start()
  muteNode.gain.value = .5
  e.target.setAttribute('disabled', true)
  e.target.innerText = 'Playing'
})

// mute/unmute button
document.querySelector('#mute').addEventListener('click', e => {
  muteNode.gain.setTargetAtTime(playing ? 0 : .5, audioCtx.currentTime, SMOOTHING)
  playing = !playing
  e.target.innerText = playing ? 'Mute' : 'Unmute'
})

// oscillator type
function setOscillatorType(value) {
  oscillatorNode.type = value
}

oscillatorType.addEventListener('change', e => {
  setOscillatorType(e.target.value)
})

// oscillator frequency
function setFrequency(value) {
  oscillatorNode.frequency.setTargetAtTime(getFrequencyValue(value), audioCtx.currentTime, SMOOTHING)
}

frequency.addEventListener('input', e => {
  setFrequency(e.target.value)
})

// filter cutoff
function setCutoff(value) {
  filterNode.frequency.setTargetAtTime(getFrequencyValue(value), audioCtx.currentTime, SMOOTHING)
}

cutoff.addEventListener('input', e => {
  setCutoff(e.target.value)
})

// filter resonance
function setQ(value) {
  filterNode.Q.setTargetAtTime((value / 100) * Q_MULTIPLIER, audioCtx.currentTime, SMOOTHING)
}

q.addEventListener('input', e => {
  setQ(e.target.value)
})

// bypass distortion
function setDistortionToggler(value) {
  if (value) {
    connectNode(distortionNode)
    distortionAmount.removeAttribute('disabled')
  } else {
    disconnectNode(distortionNode)
    distortionAmount.setAttribute('disabled', true)
  }
}

distortionToggle.addEventListener('change', e => {
  setDistortionToggler(e.target.checked)
})

// distortion amount
function setDistortionAmount(value) {
  distortionNode.curve = makeDistortionCurve(Number(value))
  distortionVisualizer.innerHTML = ''
  distortionVisualizer.appendChild(plotFloat32Array(distortionNode.curve))
}

distortionAmount.addEventListener('input', e => {
  setDistortionAmount(e.target.value)
})

// output level
function setOutputLevel(value) {
  outputNode.gain.setTargetAtTime(value / 100, audioCtx.currentTime, SMOOTHING)
}

outputLevel.addEventListener('input', e => {
  setOutputLevel(e.target.value)
})

// connect nodes
// final node is destination
// nodes.push(audioCtx.destination)
addNode(audioCtx.destination)
connectNodes()

function initValues() {
  setOscillatorType(oscillatorType.value)
  setFrequency(frequency.value)
  setCutoff(cutoff.value)
  setQ(q.value)
  setOutputLevel(outputLevel.value)
  setDistortionToggler(distortionToggle.checked)
  setDistortionAmount(distortionAmount.value)
}

function addNode(node, connected = true) {
  nodes.push({
    node,
    connected,
  })
}

function getChainNode(node) {
  return nodes.find(n => n.node === node)
}

// sets a node as disconnected then reconnects all nodes
function disconnectNode(node) {
  const chainNode = getChainNode(node)
  chainNode.connected = false
  reconnectAllNodes()
}

// sets a node as connected then reconnects all nodes
function connectNode(node) {
  const chainNode = getChainNode(node)
  chainNode.connected = true
  reconnectAllNodes()
}

function connectNodes() {
  const nodesToConnect = nodes.filter(node => node.connected)
  nodesToConnect.reduce((prev, curr) => {
    prev.node.connect(curr.node)
    return curr
  })
}

function disconnectAllNodes() {
  const connectedNodes = nodes.filter(node => node.connected)
  connectedNodes.forEach(node => {
    node.node.disconnect()
  })
}

function reconnectAllNodes() {
  disconnectAllNodes()
  connectNodes()
}

function plotFloat32Array(array) {
  const svgns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgns, "svg");
  svg.setAttribute("viewBox", "-1 -1 2 2");
  svg.setAttribute("width", "100");
  svg.setAttribute("height", "100");
  const path = document.createElementNS(svgns, "path");
  const step = Math.max(Math.floor(array.length / 100), 1);
  let d = `M${-1},${2 - 2 * (array[0] + 1)}`;
  for (let i = step; i < array.length; i += step) {
    const x = -1 + i * (2 / (array.length - 1));
    const y = 2 - 2 * (array[i] + 1);
    d += ` L${x},${y}`;
  }
  const lastX = -1 + (array.length - 1) * (2 / (array.length - 1));
  d += ` L${lastX},${2 - 2 * (array[array.length - 1] + 1)}`;
  path.setAttribute("d", d);
  path.setAttribute("stroke-width", "0.1");
  path.setAttribute("fill", "none");
  svg.appendChild(path);
  return svg;
}

initValues()
