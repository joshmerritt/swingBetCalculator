import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import Scores from '../Scores';

class AutoCompleteText extends Component {
  constructor (props) {
    super(props);
    this.state = {
      users: [],
      suggestions: [],
      text: '',
    }
  }

  componentDidMount() {
    this.props.firebase.users().on('value', snapshot => {
      const currentUsers = snapshot.val();
      const playerList = this.state.users;
      for(let item in currentUsers) {
        playerList.push(currentUsers[item].username)
      }
      this.setState({
        users: playerList,
      });
    });
    console.log(this.state.users);
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  onTextChanged = (event) => {
    const value = event.target.value;
    let suggestions = [];
    if(value.length > 0) {
      const regex = new RegExp(`^${value}`, 'i');
      suggestions = this.state.users.sort().filter(item => regex.test(item));
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
      <div className='SelectPlayer'>
        <div className='AutoCompleteText'>
          <input value={text} onChange={this.onTextChanged} type='text' />
          {this.renderSuggestions()}
        </div>
 
      </div>
    )
  }
} 

export default withFirebase(AutoCompleteText);
