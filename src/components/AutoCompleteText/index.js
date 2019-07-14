import React, { Component } from 'react';

class AutoCompleteText extends Component {
  constructor (props) {
    super(props);
    this.items = [
      'Josh',
      'Hunter',
      'Tiger',
    ];
    this.state = {
      suggestions: [],
      text: '',
    }
  }

  onTextChanged = (event) => {
    const value = event.target.value;
    let suggestions = [];
    if(value.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      suggestions = this.items.sort().filter(item => regex.test(item));
    }
      this.setState(() =>  ({ suggestions, text: value }));     
      
  }

  suggestionSelected (value) {
    this.setState(() => ({
      text: value,
      suggestions: [],
    }))
  }

  renderSuggestions () {
    const { suggestions } = this.state;
    if (suggestions.length === 0) {
      return null;
    }
    return (
      <ul>
        {suggestions.map((item) => <li onClick={() => this.suggestionSelected(item)}>{item}</li>)}
      </ul>
    )
  }

  render () {
    const { text } = this.state;
    return (
      <div>
        <input value={text} onChange={this.onTextChanged} type='text' />
        {this.renderSuggestions()}
      </div>
    )
  }
} 

export default AutoCompleteText;
