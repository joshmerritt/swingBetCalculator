import React, { Component } from 'react';
import { withFirebase } from '../Firebase';


class CreateNewScorecard extends Component {
  constructor (props) {
    super(props);
    this.state = {
      users: [],
      suggestions: [],
      text: '',
      playerList: [],
      loading: true,
    }
    this.createScorecard = this.createScorecard.bind(this);
  }

  componentDidMount() {
    this.props.firebase.users().on('value', snapshot => {
      const currentUsers = snapshot.val();
      const userList = this.state.users;
      for(let item in currentUsers) {
        userList.push(currentUsers[item].username)
      }
      console.log('this.state', this.state);
      this.setState({
        users: userList,
        loading: false,
      });
    });
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
    let tempList = this.state.playerList;
    tempList.push(value);
    this.setState(() => ({
      playerList: tempList,
      player: value,
      text: '',
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
        {suggestions.map((item) => <li key={item} onClick={() => this.suggestionSelected(item)}>{item}</li>)}
      </ul>
    )
  }

  renderPlayers () {
    if (this.state.playerList.length === 0) {
      return null;
    }
    return (
      <ul>
        {this.state.playerList.map((item) => <li key={item}>{item}</li>)}
      </ul>
    )
  }

  createScorecard (event) {
    let today = new Date();
    today = today.toString();
    let newRecord = this.props.firebase.db.ref('scorecards/').push();
    let newItem = {
      dateOfRound: today,
      players: this.state.playerList,
    };
    newRecord.set(newItem);
  }

  render () {
    const { text, loading } = this.state;
    if(loading){
      return <div>Loading Players</div>
    };
    return (
      <div className='SelectPlayer'>
        {this.renderPlayers()}
        <button className='CreateScorecard' onClick={this.createScorecard}>
          Create Scorecard
        </button>
        <br/> <br/>
        <div className='AutoCompleteText'>
            <input value={text} onChange={this.onTextChanged} type='text' /> 
            {this.renderSuggestions()}
        </div>
        <br/>
      </div>
    )
  }
} 

export default withFirebase(CreateNewScorecard);
