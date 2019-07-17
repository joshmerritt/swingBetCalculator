import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import Firebase from '../Firebase';

class AutoCompleteText extends Component {
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
    this.createScorecard = this.createScorecard.bind(this);
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
        {this.state.playerList.map((item) => <li>{item}</li>)}
      </ul>
    )
  }

  createScorecard (event) {
    const firebaseRef = Firebase.database().ref().child('First Entry');
    // console.log('this.props.firebase.db', this.props.firebase.db);
    // let today = new Date();
    // event.preventDefault();
    // this.props.firebase.scorecard().push({
    //   date: today,
    // });
    console.log(firebaseRef);
    console.log('playerlist', this.playerList);
    for(let player in this.playerList) {
      console.log('this.props.firebase.db', this.props.firebase.db);
      console.log('player', player);
    }
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

export default withFirebase(AutoCompleteText);
