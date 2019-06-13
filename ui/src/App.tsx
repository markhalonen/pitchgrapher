import * as React from 'react';
import './App.css';
import Plot from 'react-plotly.js';
import Pitchfinder from "pitchfinder";
import { CMajorFrequencies, CMajorNotes } from './notes';


interface IState {
  pitches: number[]
}

class App extends React.Component<any, IState> {

  private audioContext: any
  private analyzer: any
  private mediaStreamSource: any
  private buf: any

  constructor(props: any) {
    super(props)
    this.state = {
      pitches: Array(250).fill(-10)
    }
    this.clicked = this.clicked.bind(this);
    this.handleNewPitch = this.handleNewPitch.bind(this);
    this.handleStream = this.handleStream.bind(this);
  }

  public render() {
    return (
      <div className="App">
        <div>
          <h3 style={{ color: 'white' }}>Click start to begin</h3>
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
              type: 'scatter',
              x: this.state.pitches.map((_, idx) => idx).slice(this.state.pitches.length - 250),
              y: this.state.pitches.slice(this.state.pitches.length - 250),
              yaxis: 'y'
            },
            {
              labels: [],
              marker: { color: 'yellow' },
              type: 'scatter',
              x: this.state.pitches.map((_, idx) => idx).slice(this.state.pitches.length - 250),
              y: this.state.pitches.slice(this.state.pitches.length - 250),
              yaxis: 'y2'
            },
          ]}
          layout={{
            height: 700,
            showlegend: false,
            yaxis: { range: [0, 1000], title: "Hz", color: 'white' },
            plot_bgcolor: '#222',
            paper_bgcolor: "#222",
            xaxis: { showticklabels: false, color: 'white' },
            yaxis2: {
              range: [0, 1000],
              side: "right" as any,
              title: 'Note',
              zeroline: false,
              color: 'white',
              tickvals: CMajorFrequencies,
              ticktext: CMajorNotes
            }
          }}
          config={{ staticPlot: true, }}
        />
      </div>
    );
  }

  private handleNewPitch(pitch: number) {
    this.state.pitches.push(pitch)
    this.setState({ pitches: this.state.pitches })
  }

  private handleStream() {
    this.analyzer.getFloatTimeDomainData(this.buf);
    const detectPitch = new Pitchfinder.AMDF();

    const pitch = detectPitch(this.buf);
    this.handleNewPitch(pitch)

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
