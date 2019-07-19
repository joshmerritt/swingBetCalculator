import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

/* 
  Calculates the scores for the given scorecard.

  
*/

class CalculateScores extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      players: [],
      scorecard: [],
      course: [],
      loading: true,
    };
  }

  /* Load user list, most recent scorecard, and course */
  componentDidMount() {
    this.props.firebase.scorecards().on('value', snapshot => {
      const scorecardObject = snapshot.val();
      const scorecardList = Object.keys(scorecardObject).map(key => ({
        ...scorecardObject[key],
        uid: key,
      }));
      let lastScorecard = scorecardList[scorecardList.length-1];
      this.setState({
        scorecard: lastScorecard,
        players: lastScorecard.players,
      });
      if(lastScorecard.players && lastScorecard.players[0].uid && lastScorecard.players[0].holes) {
        this.setState({loading: false});
      }
    });
    this.props.firebase.courses().once('value', snapshot => {
      const coursesObject = snapshot.val();
      const coursesList = Object.keys(coursesObject).map(key => ({
        ...coursesObject[key],
        uid: key,
      }));
      let lastCourse = coursesList[coursesList.length-1];
      this.setState({
        course: lastCourse,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.scorecards().off();
  }

  // onHandicapChange = event => {
  //   const value = event.target.value;
  //   if(value >= 0) {
  //     const tempId = event.target.id;
  //     let players = this.state.scorecard.players;
  //     let playersIndex = '';
  //     let player = players.find(function(item, index) {
  //       playersIndex = index;
  //       return tempId === item.uid
  //     });
  //     player.handicap = event.target.value;
  //     players[playersIndex] = player;
  //     this.setState({players: players});
  //   };
  // }

  // onScoreChange = event => {
  //   const value = event.target.value;
  //   let tempValues = event.target.id.split(' ');
  //   const nameLength = tempValues.length - 1;
  //   const holeName = tempValues[nameLength];
  //   let playerName = '';
  //   for(let i=0; i < nameLength; i++) {
  //     playerName += tempValues[i];
  //     if(i < (nameLength -1)) playerName += " ";
  //   }
  //   if(value >= 0) {
  //     let players = this.state.scorecard.players;
  //     let playersIndex = '';
  //     let player = players.find(function(item, index) {
  //       playersIndex = index;
  //       return playerName === item.username
  //     });
  //     let holes = player.holes;
  //     let holeIndex = '';
  //     holes.find(function(item, index){
  //       holeIndex = index;
  //       return holeName === item.name
  //     })
  //     player.holes[holeIndex].score = value;
  //     players[playersIndex] = player;
  //     this.setState({players: players});
  //   };
  // }

  saveScorecard(event) {
    event.preventDefault();
    const currentScorecardKey = this.state.scorecard.uid;
    let newRecord = this.props.firebase.db.ref('scorecards/' + currentScorecardKey);
    newRecord.set(this.state.scorecard.players);
    this.props.history.push(ROUTES.HOME);
  }

  render() {
    if(this.state.loading){
      if(this.state.scorecard.players && !this.state.scorecard.players[0].holes) {
        return (
          <div>
            <button onClick={this.updatePlayerData}>Initialize Scorecard</button>
          </div>
        )
      } else {
        return (
          <div>
            <h2>Calculating scores</h2>
          </div>
        )
      }
    } else {
      return (
        <div className="results">
          <h1>Results</h1>
        </div>
      );
    }
  }
}



export default withFirebase(CalculateScores);
