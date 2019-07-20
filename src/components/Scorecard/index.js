import React, { Component } from 'react';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

/* 
  Creates a scorecard table for the most recent created scorecard.
  

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
  this.renderResults = this.renderResults.bind(this);
  }

  /* Load user list, most recent scorecard, and course */
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

  componentWillUnmount() {
    this.props.firebase.users().off();
    this.props.firebase.scorecards().off();
  }

  /* Create Holes array to hold each players scores */
  updatePlayerData() {
    let playersTemp = [];
    let holes = [
      {name: 'hole1', score: ''}, {name: 'hole2', score: ''}, {name: 'hole3', score: ''}, 
      {name: 'hole4', score: ''}, {name: 'hole5', score: ''}, {name: 'hole6', score: ''}, 
      {name: 'hole7', score: ''}, {name: 'hole8', score: ''}, {name: 'hole9', score: ''},
      {name: 'hole10', score: ''}, {name: 'hole11', score: ''}, {name: 'hole12', score: ''}, 
      {name: 'hole13', score: ''}, {name: 'hole14', score: ''}, {name: 'hole15', score: ''}, 
      {name: 'hole16', score: ''}, {name: 'hole17', score: ''}, {name: 'hole18', score: ''},
    ];
    for (let i = 0; i < this.state.scorecard.players.length; i++) {
      let tempPlayer = this.state.scorecard.players[i];
      let tempUser = this.state.users.find(player => player.username === tempPlayer);
      tempUser.holes = holes;
      playersTemp.push(tempUser);
    };
    let today = new Date();
    today = today.toString();
    let scorecardTemp = this.props.firebase.scorecard(this.state.scorecard.uid);
    scorecardTemp.set({
      players: playersTemp,
      dateOfRound: today,
    });
    this.setState({loading: false});
  }

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
      this.setState({players: players});
    };
  }

  onScoreChange = event => {
    const value = event.target.value;
    let tempValues = event.target.id.split(' ');
    const nameLength = tempValues.length - 1;
    const holeName = tempValues[nameLength];
    let playerName = '';
    for(let i=0; i < nameLength; i++) {
      playerName += tempValues[i];
      if(i < (nameLength -1)) playerName += " ";
    }
    if(value >= 0) {
      let players = this.state.scorecard.players;
      let playersIndex = '';
      let player = players.find(function(item, index) {
        playersIndex = index;
        return playerName === item.username
      });
      let holes = player.holes;
      let holeIndex = '';
      holes.find(function(item, index){
        holeIndex = index;
        return holeName === item.name
      })
      player.holes[holeIndex].score = value;
      players[playersIndex] = player;
      this.setState({players: players});
    };
  }

  updateSwingers = event => {
    const playerName = event.target.name;
    let players = this.state.scorecard.players;
    let playersIndex = '';
    let player = players.find(function(item, index) {
      //console.log('playerName : username : index', playerName, " : ", item.username, " : ", index);
      playersIndex = index;
      return playerName === item.username
    });
    player.swinger = !player.swinger;
    players[playersIndex] = player;
    this.setState({players: players});
  };


  saveScorecard = event => {
    const currentScorecardKey = this.state.scorecard.uid;
    let newRecord = this.props.firebase.db.ref('scorecards/' + currentScorecardKey);
    newRecord.set(this.state.scorecard);
    event.preventDefault();
    this.calculateScores();
//    this.props.history.push(ROUTES.HOME);
  }

  calculateScores() {
    this.createMatchups();
    const theCourse = this.state.course;
    const theScorecard = this.state.scorecard;
    theScorecard.matchups.forEach(function(matchup) {
      let tempMatchups = [];
      let ids = matchup.players;
      let swingersRunningTotal = 0;
      theCourse.holes.forEach(function(hole, index){
        let par = hole.par;
        let holeHandicap = hole.handicap;
        let players = ids.map(function(id){
          return theScorecard.players.find(function(player){
            return player.uid === id
          });
        });
        let handicapScores = [];
        let handicapWinner;
        players.forEach(function(player){
          let playerHandicap = Number(player.handicap);
          let numHandicapStrokes = 0;
          while(playerHandicap >= holeHandicap) {
            numHandicapStrokes -= 1;
            playerHandicap -= 18;
          }
          handicapScores.push(Number(player.holes[index].score) + numHandicapStrokes);
        });
        let swingerLowHandicapScore = Math.min(handicapScores[0], handicapScores[1]);
        let oppLowHandicapScore = Math.min(handicapScores[2], handicapScores[3]);
        if(swingerLowHandicapScore < oppLowHandicapScore) {
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
        let strokeResult = ( strokesUnderParDifference ? handicapWinner + ' and Swingers gained ' + strokesUnderParDifference + ' for being under par. Swingers total: ' + swingersRunningTotal + '. ':  handicapWinner + ' and Opponents gained ' + strokesUnderParDifference + ' for being under par. Swingers total: ' + swingersRunningTotal + '. ');
        tempMatchups.push(strokeResult);
      });
      matchup.result = tempMatchups;
      matchup.totalResult = swingersRunningTotal;
    });
    let newRecord = this.props.firebase.db.ref('scorecards/' + this.state.scorecard.uid);
    newRecord.set(this.state.scorecard);
    this.renderResults();
  }

  createMatchups() {
    let thisScorecard = this.state.scorecard;
    let matchups = [];
    const playersTemp = this.state.scorecard.players;
    let swingers = playersTemp.filter(player => player.swinger);
    let opponents = playersTemp.filter(player => !player.swinger);
    const numOpps = opponents.length;
    for(let i = 0; i < numOpps; i++) {
      for(let j = i+1; j<numOpps; j++) {
        let thisMatchup = {players: [swingers[0].uid, swingers[1].uid], result:''};
        thisMatchup.players.push(opponents[i].uid);
        thisMatchup.players.push(opponents[j].uid);
        matchups.push(thisMatchup);
      }
    }
    thisScorecard.matchups = matchups;
    this.setState({scorecard: thisScorecard});
  }

  renderResults() {
    console.log('renderResults matchups', this.state.scorecard.matchups);
    if(this.state.scorecard.matchups){
      
    }
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
                          <input className="hole" id={playerHole} name={player.username} value={item.score} onChange={this.onScoreChange} type="number"/>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div>
            <br/> <br/>
            <button className="saveButton" onClick={this.saveScorecard}>Save Scorecard</button>
          </div>
        </div>
      );
    }
  }
}



export default withFirebase(Scorecard);
