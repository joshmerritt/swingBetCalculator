import React, { Component } from 'react';
import { withFirebase } from '../Firebase';

class Scores extends Component {
  constructor (props) {
    super(props);
    this.state = {
      totalResults: [],
      hole1: [],
      hole2: [],
    }
  }

  onTextChanged = (event) => {
    const value = event.target.value;
    console.log(event.target, value);
    this.setState(() =>  ({hole1: value}));     
      
  }

  render () {
    const { scores } = this.state.hole1;
    return (
      <input value={scores} onChange={this.onTextChanged} type='text' />
    )
  }
}

export default Scores;