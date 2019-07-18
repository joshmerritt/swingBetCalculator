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
        this.setState({loading: false});
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
      {hole1: ''}, {hole2: ''}, {hole3: ''}, 
      {hole4: ''}, {hole5: ''}, {hole6: ''}, 
      {hole7: ''}, {hole8: ''}, {hole9: ''},
      {hole10: ''}, {hole11: ''}, {hole12: ''}, 
      {hole13: ''}, {hole14: ''}, {hole15: ''}, 
      {hole16: ''}, {hole17: ''}, {hole18: ''},
    ];
    for (let i = 0; i < this.state.scorecard.players.length; i++) {
      let tempPlayer = this.state.scorecard.players[i];
      let tempUser = this.state.users.find(player => player.username === tempPlayer);
      tempUser.holes = holes;
      playersTemp.push(tempUser);
    };
    console.log('playersTemp', playersTemp);
    let scorecardTemp = this.props.firebase.scorecard(this.state.scorecard.uid);
    console.log(scorecardTemp);
    scorecardTemp.set({
      players: playersTemp,
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  renderHoles() {
    
  }

  render() {
    if(this.state.loading){
      return <h2>Loading...</h2>
    };
    return (
      <div>
      
        <h1>Scorecard</h1>
        <ul>
          {this.state.scorecard.players.map((player) => {
            return (
              <li key={player.uid}>
                {player.username} 
                <br/>:: 
                <label>
                  Handicap:: <input className="handicap" name="handicap" value={player.handicap} onChange={this.onChange} type="number"/>
                </label>
                {/* {this.state.scorecard.players[player.uid].holes.map((hole) => {

                })} */}
              </li>
            )
          })}
        </ul>
        <button onClick={this.updatePlayerData}> Update Player Data </button>
      </div>
    );
  }
}


export default withFirebase(Scorecard);
