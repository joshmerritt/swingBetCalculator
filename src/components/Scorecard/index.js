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
    let scorecardTemp = this.props.firebase.scorecard(this.state.scorecard.uid);
    scorecardTemp.set({
      players: playersTemp,
    });
    this.setState({loading: false});
  }

  componentWillUnmount() {
    this.props.firebase.off();
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
      player.handicap = event.target.value;
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

  saveScorecard(event) {
    event.preventDefault();
    const currentScorecardKey = this.state.scorecard.uid;
    console.log('currentScorecardKey', currentScorecardKey);
    let newRecord = this.props.firebase.db.ref('scorecards/' + currentScorecardKey);
    console.log('scorecard Record', newRecord);
    // let newItem = {
    //   dateOfRound: today,
    //   players: this.state.playerList,
    // };
    // this.setState({
    //   scorecard: newRecord,
    // });
    console.log('this.state', this.state);
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
                      <input type="checkbox" name={player.username} value="false"/>
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
