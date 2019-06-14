import * as React from 'react';
import './App.css';
import Plot from 'react-plotly.js';
import Pitchfinder from "pitchfinder";
import { CMajorFrequencies, CMajorNotes } from './notes';


interface IState {
  pitchesAMDF: number[]
  pitchesYIN: number[]
  startFrequency: number
  endFrequency: number
  pitchDetectors: IPitchDetector[]
}

const POINTS = 250

interface IPitchDetector {
  name: string
  detectPitch: (n: any) => any
  enabled: boolean
  color: string
  pitches: number[]
}

const pitchDetectors: IPitchDetector[] = [
  {
    name: "AMDF",
    detectPitch: new Pitchfinder.AMDF(),
    enabled: true,
    color: 'yellow',
    pitches: Array(POINTS).fill(-10),
  },
  {
    name: "YIN",
    detectPitch: new Pitchfinder.YIN(),
    enabled: false,
    color: 'red',
    pitches: Array(POINTS).fill(-10),
  },
  {
    name: "Dynamic Wavelet",
    detectPitch: new Pitchfinder.DynamicWavelet(),
    enabled: false,
    color: 'green',
    pitches: Array(POINTS).fill(-10),
  },
  {
    name: 'Macleod',
    detectPitch: new Pitchfinder.Macleod(),
    enabled: false,
    color: 'blue',
    pitches: Array(POINTS).fill(-10),
  }
]

class App extends React.Component<any, IState> {

  private audioContext: any
  private analyzer: any
  private mediaStreamSource: any
  private buf: any

  constructor(props: any) {
    super(props)
    this.state = {
      pitchesAMDF: Array(POINTS).fill(-10),
      pitchesYIN: Array(POINTS).fill(-10),
      startFrequency: 0,
      endFrequency: 1000,
      pitchDetectors
    }
    this.clicked = this.clicked.bind(this);
    this.handleStream = this.handleStream.bind(this);
    this.handleChangeStartFrequency = this.handleChangeStartFrequency.bind(this)
    this.handleChangeEndFrequency = this.handleChangeEndFrequency.bind(this)

  }

  public render() {
    return (
      <div className="App">
        <div>
          <h3 style={{ color: 'white' }}>Pitch Grapher listens with the microphone and graphs the pitch over time</h3>
        </div>
        <div>
          <button
            onClick={this.clicked}
            style={{ padding: 10, margin: 5, borderRadius: 5, backgroundColor: 'red', border: 0, color: 'white', fontSize: 25 }}>Start!</button>
        </div>
        <Plot
          data={[
            {
              labels: [],
              marker: { color: 'yellow' },
              type: 'scatter' as any,
              x: [],
              y: [],
              yaxis: 'y',
            },
            ...this.state.pitchDetectors.filter(p => p.enabled).map(p => ({
              labels: [],
              marker: { color: p.color },
              type: 'scatter' as any,
              x: p.pitches.map((_, idx) => idx).slice(p.pitches.length - POINTS),
              y: p.pitches.slice(p.pitches.length - POINTS),
              yaxis: 'y2',
              name: p.name
            })),

          ]}
          layout={{
            height: 700,
            yaxis: { range: [this.state.startFrequency, this.state.endFrequency], title: "Hz", color: 'white' },
            plot_bgcolor: '#222',
            paper_bgcolor: "#222",
            xaxis: { showticklabels: false, color: 'white' },
            yaxis2: {
              range: [this.state.startFrequency, this.state.endFrequency],
              side: "right" as any,
              title: 'Note',
              zeroline: false,
              color: 'white',
              tickvals: CMajorFrequencies,
              ticktext: CMajorNotes
            },
            showlegend: true
          }}
          config={{ staticPlot: true }}
        />
        <div style={{ textAlign: 'center', marginBottom: 100 }}>


          <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', marginBottom: 100 }}>
            <div />
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ color: 'white' }}>Options</h3>
              <div style={{ marginBottom: 5 }}>
                <p style={{ color: 'white' }}><u>Frequency Range:</u></p>
                <label style={{ color: 'white' }}>
                  Start Frequency:
          <input type="text" value={this.state.startFrequency} onChange={this.handleChangeStartFrequency} style={{ marginLeft: 5 }} />
                </label>
              </div>
              <div>
                <label style={{ color: 'white' }}>
                  End Frequency:
          <input type="text" value={this.state.endFrequency} onChange={this.handleChangeEndFrequency} style={{ marginLeft: 5 }} />
                </label>
              </div>
              <p style={{ color: 'white' }}><u>Pitch Detection Methods:</u></p>
              {this.state.pitchDetectors.map((p, idx) => (<div key={idx}>
                <label style={{ marginRight: 10, color: 'white' }}>
                  {p.name}
                  <input type="checkbox" checked={p.enabled} onChange={this.handleCheckChanged(p)} />
                </label>
              </div>))}
              <p style={{ color: 'white' }}>Pitch detection methods courtesy of <a href="https://github.com/peterkhayes/pitchfinder" target="_blank">pitchfinder</a></p>
            </div>
            <div />
          </div>

          <h3 style={{ color: 'white' }}>Made by <a href="https://legdaytech.com/" target="_blank">Mark Halonen</a></h3>



        </div>
      </div>
    );
  }

  private handleCheckChanged = (p: IPitchDetector) => (event: any) => {
    p.enabled = event.target.checked
    this.setState({ pitchDetectors: this.state.pitchDetectors })
  }

  private handleChangeStartFrequency(event: any) {
    this.setState({ startFrequency: event.target.value })
  }

  private handleChangeEndFrequency(event: any) {
    this.setState({ endFrequency: event.target.value })
  }

  private handleStream() {
    this.analyzer.getFloatTimeDomainData(this.buf);

    this.state.pitchDetectors.forEach(p => {
      const pitch = p.detectPitch(this.buf)
      p.pitches.push(pitch)
    })

    // pry not kosher
    this.setState({ pitchDetectors: this.state.pitchDetectors })

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    window.requestAnimationFrame(this.handleStream);
  }

  private clicked() {
    this.audioContext = new AudioContext();

    const buflen = 1024;
    this.buf = new Float32Array(buflen);

    try {
      navigator.getUserMedia({ "audio": true }, (stream) => {
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

        // Connect it to the destination.
        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 2048;
        this.mediaStreamSource.connect(this.analyzer);

        this.handleStream()

      }, (err) => alert(err));

    } catch (e) {
      alert('getUserMedia threw exception :' + e);
    }

  }
}

export default App;
