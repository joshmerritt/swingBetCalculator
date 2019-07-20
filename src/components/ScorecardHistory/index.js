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

    return (
      <div>
        <h1>Results</h1>

        {loading && <div>Loading ...</div>}

        <ResultsList scorecard={scorecard} />
      </div>
    );
  }
}

const ResultsList = ({ scorecard }) => (
  console.log('scorecard', scorecard);
  <ul>
    {scorecard.map(user => (
      <li key={user.uid}>
        <span>
          <strong>ID:</strong> {user.uid}
        </span>
        <span>
          <strong>E-Mail:</strong> {user.email}
        </span>
        <span>
          <strong>Username:</strong> {user.username}
        </span>
        <span>
          <strong>Handicap:</strong> {user.handicap}
        </span>
      </li>
    ))}
  </ul>
);

export default withFirebase(ScorecardHistory);
