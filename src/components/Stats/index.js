import React, { Component } from 'react';
import { withFirebase } from '../Firebase';

/*
  - Page to calculate and display average scores and year-to-date winnings for each player  
  - Only includes scorecards where "validRound" is true
  - Only includes player rounds where "completeRound" is true


  Outline:
   - Get all scorecards
   - Get all players
   - Iterate through each scorecard, checking for validRound
   - If completeRound, add total score to array of stroke results for applicable player
   - Add total result to array of round results
   - Display table, where each line is a user with the following columns:
          # Rounds, # times Swinger, Average strokes, Average result, Total result

  WIP:
   - Format table with headers
   - Calculate average and totals from results arrays
   - Add break out showing individual player round by round results
   - Clean up unused code
*/

class Stats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      users: [],
    };
    this.updateSelectedScorecard = this.updateSelectedScorecard.bind(this);
    this.calculateStats = this.calculateStats.bind(this);
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
      this.setState({
        scorecardList: scorecardList,
      });
      this.calculateStats();
    });
    
  }

  calculateStats() {
    let players = this.state.users;
    players.forEach(function(player){
      player.strokeResults = [];
      player.roundResults = [];
      player.numCompleteRounds = 0;
      player.numSwingerRounds = 0;
    });
    let scorecards = this.state.scorecardList.filter(scorecard => scorecard.validRound);
    console.log('scorecards', scorecards);
    console.log('players', players);
    scorecards.forEach(function(scorecard){
      let completeRounds = scorecard.players.filter(player => player.completeRound);
      console.log('completeRounds', completeRounds);
      completeRounds.forEach(function(round){
        let tempIndex = players.findIndex(function(player){
          return round.uid === player.uid;
        });
        players[tempIndex].strokeResults.push(round.totalScore);
        players[tempIndex].roundResults.push(round.totalResult);
        players[tempIndex].numCompleteRounds++;
        players[tempIndex].numSwingerRounds += !!round.swinger;
      });
    });
    this.setState({
      users: players,
      loading: false,
    })
  }

  componentWillUnmount() {
    this.props.firebase.scorecards().off();
    this.props.firebase.users().off();
  }

  updateSelectedScorecard(event) {
    this.setState({scorecard: this.state.scorecardList[event.target.value]})
  }


  render() {
    const { users, loading } = this.state;
    if(!loading){
      return (
        <div>
        <h3>Select Player:</h3>
          <select className="scorecardSelect" onChange={this.updateSelectedScorecard}>
            {users.map((option, index) =>
              <option key={option.username} value={index}>
                {option.username}
              </option>
              )}
          </select> 
        <ResultsList users={users} />
        </div>
      )
    } else {
      return (
        <div>
          {loading && <div>Loading ...</div>}
        </div>
      );
    }

  }
}




const ResultsList = ({ users }) => (
 <div>
   <strong>Individual Results</strong>
   <table className="stats">
   <tbody>
      {users.map((player) => {
        return (
          <tr key={player.uid}>
            <td>{player.username}</td>
            <td>
              {player.numCompleteRounds}
            </td>
            <td>{player.numSwingerRounds}</td>
          </tr>
        )
      })}
    </tbody>
    </table>\
</div>
);

const DisplayScorecard = ({ scorecard }) => (
  <div className="scorecard">
         <h1>Scorecard</h1>
          <table className="holes">
            <thead>
              <tr className="holePar">
                <th></th>
                <th></th>
                <th></th>
                <th>Par</th>
                {scorecard.course.holes.map((hole) => {
                  return (
                    <th key={hole.name + " par"}>{hole.par}</th>
                  )
                })}
              </tr>
              <tr className="holeHandicap">
                <th></th>
                <th></th>
                <th></th>
                <th>Rank</th>
                {scorecard.course.holes.map((hole) => {
                  return (
                    <th key={hole.name + " handicap"}>{hole.handicap}</th>
                  )
                })}
              </tr>
              <tr className="holeNumber">
                <th>Player</th>
                <th>Handicap</th>
                <th>Swinger?</th>
                <th>Total</th>
                {scorecard.course.holes.map((hole, index) => {
                  return (
                    <th key={hole.name}>{index+1}</th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {scorecard.players.map((player) => {
                return (
                  <tr key={player.uid}>
                    <td>{player.username}</td>
                    <td>
                      {player.handicap}
                    </td>
                    <td>
                      <input type="checkbox" name={player.username} checked={!!player.swinger} readOnly/>
                    </td>
                    <td>{player.totalScore}</td>
                    {player.handicapScores ? player.handicapScores.map((item, index) => {
                      let playerHole = player.username + index + " Score" + item.name;
                      return (
                        <td key={playerHole} style={player.scores[index] && player.scores[index] < scorecard.course.holes[index].par ? {border: "3px solid green"}: null}>
                           {item} 
                        </td>
                      )
                    }): <td>N/A</td>}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
)

export default withFirebase(Stats);
