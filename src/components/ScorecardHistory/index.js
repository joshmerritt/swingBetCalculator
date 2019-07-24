import React, { Component } from 'react';



import { withFirebase } from '../Firebase';

class ScorecardHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      users: [],
    };
    this.updateSelectedScorecard = this.updateSelectedScorecard.bind(this);
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
        scorecardList: scorecardList,
        scorecard: lastScorecard,
        players: lastScorecard.players,
      });
      if(lastScorecard.players && lastScorecard.players[0].uid && lastScorecard.players[0].holes) {
        this.setState({loading: false});
      }
    });
  }

  componentWillUnmount() {
    this.props.firebase.scorecards().off();
    this.props.firebase.users().off();
  }

  updateSelectedScorecard(event) {
    this.setState({scorecard: this.state.scorecardList[event.target.value]})
  }

  render() {
    const { scorecard, loading, scorecardList } = this.state;
    if(scorecard && scorecardList && !loading){
      return (
        <div>
        <h3>Select Round:</h3>
          <select className="scorecardSelect" onChange={this.updateSelectedScorecard}>
            {scorecardList.map((option, index) =>
              <option key={option.dateOfRound} value={index}>
                {option.dateOfRound}
              </option>
              )}
          </select>
        <h2>Results for round on</h2>
        <ResultsList scorecard={scorecard} />
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

const DisplayScorecard = ({ scorecard }) => (
  <div className="scorecard">
         <h1>Scorecard</h1>
          <table className="holes">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Hole</th>
                {scorecard.course.holes.map((hole, index) => {
                  return (
                    <th>{index+1}</th>
                  )
                })}
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th>Par</th>
                {scorecard.course.holes.map((hole) => {
                  return (
                    <th>{hole.par}</th>
                  )
                })}
              </tr>
              <tr>
                <th>Player</th>
                <th>Handicap</th>
                <th>Swinger?</th>
                <th>Rank</th>
                {scorecard.course.holes.map((hole) => {
                  return (
                    <th>{hole.handicap}</th>
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
                    <td></td>
                    {player.handicapScores.map((item, index) => {
                      let playerHole = player.username + index + " Score" + item.name;
                      return (
                        <td key={playerHole} >
                           {item} 
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
)


const ResultsList = ({ scorecard }) => (
 <div>
 <h3>{scorecard.dateOfRound}</h3>
 <DisplayScorecard scorecard={scorecard} />
 <ul>
   <strong>Individual Results</strong> (bet = ${scorecard.betAmount})
   {scorecard.players.map(player => (
     <li key={player.uid}>
       {player.username}: <strong>{player.totalResult * scorecard.betAmount}</strong>
     </li>
   ))}
  <ul><br/>
    {scorecard.matchups ? scorecard.matchups.map(matchup => (
      <ul key={matchup.players[2].uid + matchup.players[3].uid + "List"}>
        <li key={matchup.players[2].uid + matchup.players[3].uid}>
          <strong>Total Result:</strong> {matchup.totalResult}
        </li>
        <li>
          <strong> Swingers: </strong> {matchup.players[0].username + ' & ' + matchup.players[1].username}
        </li>
        <li>
          <strong> Opponents: </strong> {matchup.players[2].username + ' & ' + matchup.players[3].username}
        </li>
        <ul>
          {matchup.result.map(hole => (
            <li key={hole + matchup.players[2].uid + matchup.players[3].uid}>
              {hole}
            </li>
          ))}
        </ul>
        <br/>
      </ul>
    )): <h3>No Scores Entered</h3> }
  </ul>
  </ul>
</div>
);

export default withFirebase(ScorecardHistory);
