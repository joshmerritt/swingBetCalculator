import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';
import { withRouter } from 'react-router-dom';


class CreateScorecard extends Component {
  constructor (props) {
    super(props);
    this.state = {
      users: [],
      suggestions: [],
      text: '',
      playerList: [],
      loading: true,
    }
    this.createNewScorecard = this.createNewScorecard.bind(this);
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

  createNewScorecard (event) {
    event.preventDefault();
    let today = new Date();
    today = today.toString();
    let newRecord = this.props.firebase.db.ref('scorecards/').push();
    let newItem = {
      dateOfRound: today,
      players: this.state.playerList,
    };
    newRecord.set(newItem);
    this.props.history.push(ROUTES.SCORECARD);
  }

  render () {
    const { text, loading } = this.state;
    if(loading){
      return <div>Loading Players</div>
    };
    return (
      <div className='SelectPlayer'>
        {this.renderPlayers()}
        <h6>Press "Create Scorecard" when finished entering players.</h6>
        <button className='CreateScorecard' onClick={this.createNewScorecard}>
          Create Scorecard 
        </button>
        <br/> <br/>
        <h4>Enter Player Names</h4>
        
        <div className='AutoCompleteText'>
            <input value={text} onChange={this.onTextChanged} type='text' /> 
            {this.renderSuggestions()}
        </div>
        <br/>
      </div>
    )
  }
} 

export default withRouter(withFirebase(CreateScorecard));
