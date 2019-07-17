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
    this.props.firebase.scorecards().once('value', snapshot => {
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
    
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {

    return (
      <div>
      
        <h1>Scorecard</h1>
      </div>
    );
  }
}


export default withFirebase(Scorecard);
