import React, { Component } from 'react';

import { withFirebase } from '../Firebase';


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
  }

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
        if(lastScorecard.players[0].uid) {
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

  updatePlayerData() {
    console.log('scorecard uid', this.state.scorecard.uid);
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
    this.props.firebase.users().off();
  }

  // renderHoles() {
  //   console.log(this.state.scorecard);
  //   return (
  //     <input>this</input>
  //    {{this.state.scorecard.players[player.uid].holes.map((hole)=> {
  //          <input className="scores" name="scores" value={hole} type='number'/>
  //    })}}
  //   )
  // }

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
  };

  onScoreChange = event => {
    console.log(event.target);
    const value = event.target.value;
    let tempValues = event.target.id.split(' ');
    console.log('tempValues', tempValues);
    const nameLength = tempValues.length - 1;
    let hole = tempValues[nameLength];
    let playerName = '';
    console.log('hole', hole);
    console.log('playerName', playerName);
    for(let i=0; i < nameLength; i++) {
      playerName = playerName + tempValues[i];
    }
    console.log('playerName2', playerName);
    console.log('tempvalue',tempValues);
    console.log(value);
    console.log('this.state', this.state);
    if(value >= 0) {
      const tempId = event.target.id;
      let players = this.state.scorecard.players;
      let playersIndex = '';
      let player = players.find(function(item, index) {
        playersIndex = index;
        return tempId === item.uid
      });
      // player.handicap = event.target.value;
      // players[playersIndex] = player;
      // this.setState({players: players});
    };
  };

  // onTextChanged = (event) => {
  //   const value = event.target.value;
  //   let suggestions = [];
  //   if(value.length > 0) {
  //     const regex = new RegExp(`^${value}`, 'i');
  //     suggestions = this.state.users.sort().filter(item => regex.test(item));
  //   }
  //     this.setState(() =>  ({ suggestions, text: value }));     
  // }

  // renderHoles(player) {
  //   console.log('renderHoles player', player)
  //   player.holes.map(item => {
  //     console.log(this);
  //     return <td><input className="hole" id={player.uid} name={player.name} value={player.handicap} onChange={this.onHandicapChange} type="number"/></td>
  //   });
  // };

  render() {
    if(this.state.loading){
      return (
        <div>
          <h2>Loading...</h2>
          <button onClick={this.updatePlayerData}>Update Player Data</button>
        </div>
      )
    };
    return (
      <div className="scorecard">
       <h1>Scorecard</h1>
        <table className="holes">
          <thead>
            <tr>
              <th>Player</th>
              <th>Handicap</th>
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
                  {player.holes.map((item, index) => {
                    let playerHole = player.username + " " + item.name;
                    console.log(index);
                    return (
                      <td key={playerHole}>
                        <input className="hole" id={playerHole} name={player.name} value={item.score} onChange={this.onScoreChange} type="number"/>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>       
      </div>
    );
  }
}



export default withFirebase(Scorecard);
