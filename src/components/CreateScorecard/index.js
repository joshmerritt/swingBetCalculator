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
      numberOfMatchups: 0,
      loading: true,
      createEnabled: false,
    }
    this.createNewScorecard = this.createNewScorecard.bind(this);
    this.factorialize = this.factorialize.bind(this);
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
    this.updateNumberOfMatchups();
  }

  factorialize(num) {
      if (num === 0)
        { return 1; }
      else
        { return num * this.factorialize( num - 1 ); }
  }

  updateNumberOfMatchups () {
    let numPlayers = this.state.playerList.length;
    if(numPlayers >= 4) {
      let numMatchups = this.factorialize(numPlayers-2)/(this.factorialize(2)*this.factorialize(numPlayers-4));
      this.setState(() => ({numberOfMatchups: numMatchups, createEnabled: true}));
    };
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
    let newRecord = this.props.firebase.db.ref('scorecards/').push();
    let newItem = {
      players: this.state.playerList,
    };
    this.setState({
      scorecard: newRecord,
    });
    newRecord.set(newItem);
    this.props.history.push(ROUTES.SCORECARD);
  }

  createNewCourse (){
    let newCourse = this.props.firebase.db.ref('courses/').push();
    let newItem = {
      name: 'Sunset',
      holes: [
        {name: 'Hole1', par: 4, handicap: 11},
        {name: 'Hole2', par: 3, handicap: 13},
        {name: 'Hole3', par: 4, handicap: 17},
        {name: 'Hole4', par: 4, handicap: 3},
        {name: 'Hole5', par: 5, handicap: 15},
        {name: 'Hole6', par: 3, handicap: 9},
        {name: 'Hole7', par: 4, handicap: 5},
        {name: 'Hole8', par: 4, handicap: 1},
        {name: 'Hole9', par: 5, handicap: 7},
        {name: 'Hole10', par: 4, handicap: 16},
        {name: 'Hole11', par: 3, handicap: 10},
        {name: 'Hole12', par: 5, handicap: 6},
        {name: 'Hole13', par: 4, handicap: 14},
        {name: 'Hole14', par: 4, handicap: 4},
        {name: 'Hole15', par: 4, handicap: 8},
        {name: 'Hole16', par: 3, handicap: 18},
        {name: 'Hole17', par: 5, handicap: 12},
        {name: 'Hole18', par: 4, handicap: 2},
      ],
    };
    newCourse.set(newItem);
  }

  render () {
    const { text, loading, createEnabled } = this.state;
    if(loading){
      return <div>Loading Players</div>
    };
    return (
      <div className='SelectPlayer'>
        {this.renderPlayers()}
        <h5>With {this.state.playerList.length} {(this.state.playerList.length===1)? "player": "players"}, there will be {this.state.numberOfMatchups} {(this.state.numberOfMatchups===1)? "bet": "bets"} per hole.</h5>
        <h4>Press "Create Scorecard" when finished entering players.</h4>
        <button className='CreateScorecard' onClick={this.createNewScorecard} disabled={!createEnabled}>
          Create Scorecard 
        </button>
        <br/> <br/>
        <h4>Enter Player Names</h4>
        
        <div className='AutoCompleteText'>
            <input className='addPlayer' value={text} onChange={this.onTextChanged} type='text' /> 
            {this.renderSuggestions()}
        </div>
        <br/>
      </div>
    )
  }
} 

export default withRouter(withFirebase(CreateScorecard));
