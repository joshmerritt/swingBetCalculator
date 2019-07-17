import React, { Component } from 'react';

import { withFirebase } from '../Firebase';
import CreateNewScorecard from '../CreateNewScorecard';


class Scorecard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      players: [],
      date: new Date(),
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
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {

    return (
        <CreateNewScorecard />
    );
  }
}


export default withFirebase(Scorecard);
