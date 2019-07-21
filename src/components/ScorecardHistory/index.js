import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

class ScorecardHistory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      users: [],
    };
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
  }

  render() {
    const { scorecard, loading } = this.state;
    if(scorecard && !loading){
      return (
        <div>
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

const ResultsList = ({ scorecard }) => (
 <div>
 <h3>{scorecard.dateOfRound}</h3>
 <ul>
   <strong>Individual Results</strong>
   {scorecard.players.map(player => (
     <li key={player.uid}>
       {player.username}: <strong>{player.totalResult}</strong>
     </li>
   ))}
  <ul><br/>
    {scorecard.matchups.map(matchup => (
      <ul>
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
            <li>
              {hole}
            </li>
          ))}
        </ul>
        <br/>
      </ul>
    ))}
  </ul>
  </ul>
</div>
);

export default withFirebase(ScorecardHistory);
