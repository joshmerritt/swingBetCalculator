import React, { Component } from 'react';
//import update from "react-addons-update";
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

/* 
    - Creates a scorecard table for the most recent created scorecard
    - Allows user to select swingers, adjust handicap, and enter hole scores
    - Creates matchups for every combination of non-swinger players
    - Upon save, calculates the outcome for every hole for every matchup  
    - Redirects to view results upon save
*/

class Scorecard extends Component {
  constructor(props) {
  super(props);
  this.state = {
    users: [],
    players: [],
    scorecard: [],
    course: [],
    loading: true,
  };
  this.updatePlayerData = this.updatePlayerData.bind(this);
  this.onHandicapChange = this.onHandicapChange.bind(this);
  this.onScoreChange = this.onScoreChange.bind(this);
  this.saveScorecard = this.saveScorecard.bind(this);
  this.updateSwingers = this.updateSwingers.bind(this);
  this.onBetChanged = this.onBetChanged.bind(this);
  }

/*
    - Load user list, most recent scorecard, and course     
*/

  componentDidMount() {
      this.props.firebase.users().on('value', snapshot => {
        const usersObject = snapshot.val();
        const usersList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key,
        }));
        this.setState({
          users: usersList,
        });
      });
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

/*
    - Remove query to fetch scorecard and user data when updated  
*/

  componentWillUnmount() {
    this.props.firebase.users().off();
    this.props.firebase.scorecards().off();
  }

  /* 
    - Called by user when it's the first load of this scorecard
    - Create Holes array to hold each players scores
    - Set the date of the round to today
    - Mark the first two names as swingers 
    - Set default bet to 1  
  */

  updatePlayerData() {
    let thisScorecard = {...this.state.scorecard};
    let playersTemp = [];
    let holes = [
      {name: 'hole1', score: ''}, {name: 'hole2', score: ''}, {name: 'hole3', score: ''}, 
      {name: 'hole4', score: ''}, {name: 'hole5', score: ''}, {name: 'hole6', score: ''}, 
      {name: 'hole7', score: ''}, {name: 'hole8', score: ''}, {name: 'hole9', score: ''},
      {name: 'hole10', score: ''}, {name: 'hole11', score: ''}, {name: 'hole12', score: ''}, 
      {name: 'hole13', score: ''}, {name: 'hole14', score: ''}, {name: 'hole15', score: ''}, 
      {name: 'hole16', score: ''}, {name: 'hole17', score: ''}, {name: 'hole18', score: ''},
    ];
    for (let i = 0; i < thisScorecard.players.length; i++) {
      let tempPlayer = thisScorecard.players[i];
      let tempUser = this.state.users.find(player => player.username === tempPlayer);
      tempUser.holes = holes;
      if(i<2) tempUser.swinger = true;
      playersTemp.push(tempUser);
    };
    let today = new Date();
    today = today.toString();
    let scorecardTemp = this.props.firebase.scorecard(thisScorecard.uid);
    scorecardTemp.set({
      players: playersTemp,
      dateOfRound: today,
      betAmount: 1,
    });   
  }

/*
    - Update a players handicap for this scorecard
*/

  onHandicapChange = event => {
    const value = event.target.value;
    if(value >= 0) {
      const tempId = event.target.id;
      let players = this.state.scorecard.players;
      let playersIndex = '';
      let player = players.find(function(item, index) {
        playersIndex = index;
        return tempId === item.uid
      });
      player.handicap = Number(event.target.value);
      players[playersIndex] = player;
      let thisScorecard = this.state.scorecard;
      thisScorecard.players = players;
      this.setState({scorecard: thisScorecard});
    };
  }

/*
    - Upsert new value entered as a score
    - Save to state
*/

  onScoreChange = event => {
    const value = event.target.value;
    const holeIndex = event.target.name;
    const playerId = event.target.id;
    let thisScorecard = {...this.state.scorecard};
    if(value >= 0) {
      let players = thisScorecard.players;
      let playersIndex = null;
      let player = players.find(function(item, index) {
        playersIndex = index;
        return playerId === item.uid
      });
      player.holes[holeIndex].score = value;
      players[playersIndex] = player;
      thisScorecard.players = players;
      this.setState({scorecard: thisScorecard});
    };
  }

/*
    - Update which players are indicated as swingers
    - Save to state
*/
  
  updateSwingers = event => {
    const playerName = event.target.name;
    let players = this.state.scorecard.players;
    let playersIndex = '';
    let player = players.find(function(item, index) {
      playersIndex = index;
      return playerName === item.username
    });
    player.swinger = !player.swinger;
    players[playersIndex] = player;
    this.setState({players: players});
  }

/*
    - Save the scorecard to the database and call calculateScores
*/ 

  saveScorecard = event => {
    const currentScorecardKey = this.state.scorecard.uid;
    let newRecord = this.props.firebase.db.ref('scorecards/' + currentScorecardKey);
    newRecord.set(this.state.scorecard);
    event.preventDefault();
    this.calculateScores();
    this.props.history.push(ROUTES.SCORECARD_HISTORY);
  }

/*
    - Calls createMatchups
    - Iterates through each matchup
    - For every hole calculate each players natural and handicap score
    - Compare the team's lowest handicap adjusted score to determine winner
    - Compare each team's natural strokes under par total
    - Determine result and store to results object
    - Keep track of runnning total
    - Add total result of matchup to each player's individual result
    - Save to database
*/

calculateScores() {
    this.createMatchups();
    const theCourse = {...this.state.course};
    const theScorecard = {...this.state.scorecard};
    theScorecard.players.forEach(function(player){
      player.handicapScores = [];
    });
    theScorecard.matchups.forEach(function(matchup) {
      let tempMatchups = [];
      let ids = matchup.players;
      let swingersRunningTotal = 0;
      let handicapScores = [];
      theCourse.holes.forEach(function(hole, index){
        let par = hole.par;
        let holeHandicap = hole.handicap;
        let players = ids.map(function(id){
          return theScorecard.players.find(function(player){
            return player.uid === id.uid
          });
        });
        let handicapWinner;
        players.forEach(function(player){
          let playerHandicap = Number(player.handicap);
          let numHandicapStrokes = 0;
          let handicapScore = Number(player.holes[index].score);
          while(playerHandicap >= holeHandicap) {
            numHandicapStrokes -= 1;
            playerHandicap -= 18;
          }
          handicapScore += numHandicapStrokes;
          let textHandicapScore = (numHandicapStrokes < 0 ? handicapScore + "/" + (handicapScore + numHandicapStrokes) : handicapScore);
          player.handicapScores.push(textHandicapScore);
          handicapScores.push(Number(handicapScore));
        });
        let swingerLowHandicapScore = Math.min(handicapScores[0], handicapScores[1]);
        let oppLowHandicapScore = Math.min(handicapScores[2], handicapScores[3]);
        if(swingerLowHandicapScore <= oppLowHandicapScore) {
          if(swingerLowHandicapScore === oppLowHandicapScore){
            handicapWinner = 'Tied ' + hole.name;
          } else {
            handicapWinner = 'Swingers won ' + hole.name;
            swingersRunningTotal += 1;
          }
        } else {
          handicapWinner = 'Opponents won ' + hole.name;
          swingersRunningTotal -= 1;
        }
        let swingersUnderPar = Math.max(0, par - players[0].holes[index].score) + Math.max(0, par - players[1].holes[index].score);
        let oppsUnderPar = Math.max(0, par - players[2].holes[index].score) + Math.max(0, par - players[3].holes[index].score);
        let strokesUnderParDifference = swingersUnderPar - oppsUnderPar;
        swingersRunningTotal += strokesUnderParDifference;
        let strokeResult = ( strokesUnderParDifference > 0 ? (handicapWinner + ' and Swingers gained ' + strokesUnderParDifference + ' for being under par. Swingers total: ' + swingersRunningTotal + '. '):  (handicapWinner + ' and Opponents gained ' + -strokesUnderParDifference + ' for being under par. Swingers total: ' + swingersRunningTotal + '. '));
        tempMatchups.push(strokeResult);
      });
      matchup.result = tempMatchups;
      matchup.totalResult = swingersRunningTotal;
      theScorecard.players.forEach(function(player) {
        if(player.uid === matchup.players[0].uid || player.uid === matchup.players[1].uid) {
          player.totalResult += (swingersRunningTotal);
        } else if(player.uid === matchup.players[2].uid || player.uid === matchup.players[3].uid) {
          player.totalResult -= (swingersRunningTotal);
        }
      });
    });
    let newRecord = this.props.firebase.db.ref('scorecards/' + this.state.scorecard.uid);
    newRecord.set(this.state.scorecard);
  }

  /*
      - Initialize player's total result to 0
      - Create array of swingers and opponents
      - Loop through to create every combination of opponents
      - Store all matchups on the local scorecard
  */

  createMatchups() {
    let thisScorecard = this.state.scorecard;
    let matchups = [];
    const playersTemp = this.state.scorecard.players;
    playersTemp.forEach(function(player){
      player.totalResult = 0;
    });
    let swingers = playersTemp.filter(player => player.swinger);
    let opponents = playersTemp.filter(player => !player.swinger);
    const numOpps = opponents.length;
    for(let i = 0; i < numOpps; i++) {
      for(let j = i+1; j<numOpps; j++) {
        let thisMatchup = {players: [swingers[0], swingers[1]], result:''};
        thisMatchup.players.push(opponents[i]);
        thisMatchup.players.push(opponents[j]);
        matchups.push(thisMatchup);
      }
    }
    thisScorecard.matchups = matchups;
    this.setState({scorecard: thisScorecard});
  }

  /*
      Update the bet amount when it is changed
  */

  onBetChanged(event) {
    const newBetAmount = event.target.value;
    let scorecard = this.state.scorecard;
    scorecard.betAmount = newBetAmount;
    this.setState({scorecard: scorecard});
  }
  
  /*
      - Display loading if data not loaded yet
      - Display initialize button if first load of this scorecard
      - Display Scorecard
      - Display bet amount input
      - Display Save Scorecard button
  */

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
            <h2>Fetching scorecard</h2>
          </div>
        )
      }
    } else {
      return (
        <div className="scorecard">
         <h1>Scorecard</h1>
          <table className="holes">
            <thead>
              <tr>
                <th>Player</th>
                <th>Handicap</th>
                <th>Swinger?</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
                <th>4</th>
                <th>5</th>
                <th>6</th>
                <th>7</th>
                <th>8</th>
                <th>9</th>
                <th>10</th>
                <th>11</th>
                <th>12</th>
                <th>13</th>
                <th>14</th>
                <th>15</th>
                <th>16</th>
                <th>17</th>
                <th>18</th>
              </tr>
            </thead>
            <tbody>
              {this.state.scorecard.players.map((player) => {
                return (
                  <tr key={player.uid}>
                    <td>{player.username}</td>
                    <td>
                      <input className="handicap" id={player.uid} name={player.name} value={player.handicap} onChange={this.onHandicapChange} type="number"/>
                    </td>
                    <td>
                      <input type="checkbox" name={player.username} onChange={this.updateSwingers} checked={!!player.swinger}/>
                    </td>
                    {player.holes.map((item, index) => {
                      let playerHole = player.username + " " + item.name;
                      return (
                        <td key={playerHole}>
                          <input className="hole" id={player.uid} name={index} value={item.score} onChange={this.onScoreChange} type="number"/>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div>
             <span>
              <p>Bet Amount</p>
              <input className="betAmount" value={this.state.scorecard.betAmount} onChange={this.onBetChanged} type="number"/>
              <br/>
              <button className="saveButton" onClick={this.saveScorecard}>Save Scorecard</button>
            </span>
          </div>
        </div>
      );
    }
  }
}



export default withFirebase(Scorecard);
