import * as React from 'react';
import './App.css';
import Plot from 'react-plotly.js';

import { pitchDetect, toggleLiveInput, setPitchCallback } from './pitchDetect'

interface IState {
  pitches: number[]
}

class App extends React.Component<any, IState> {

  constructor(props: any) {
    super(props)
    this.state = {
      pitches: []
    }
    this.clicked = this.clicked.bind(this);
  }

  public render() {
    return (
      <div className="App">
        <div>
          <button onClick={this.clicked} style={{ padding: 10, margin: 10 }}>Start!</button>
        </div>
        <Plot
          data={[
            {
              labels: [],
              marker: { color: 'yellow' },
              type: 'scatter',
              x: this.state.pitches.map((_, idx) => idx).slice(this.state.pitches.length - 1000),
              y: this.state.pitches.slice(this.state.pitches.length - 1000),
            },
          ]}
          layout={{ title: 'A Fancy Plot', yaxis: { range: [0, 1000] }, plot_bgcolor: '#222', paper_bgcolor: "#222", xaxis: {} }}
        />
        );
      </div>
    );
  }

  private clicked() {
    setPitchCallback((val: any) => {
      console.log(val)
      this.state.pitches.push(val)
      this.setState({ pitches: this.state.pitches })
    })
    pitchDetect()
    toggleLiveInput()
  }
}

export default App;
