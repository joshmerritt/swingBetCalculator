import React, { Component } from 'react';

import { withFirebase } from '../Firebase';
import AutoCompleteText from '../AutoCompleteText';

class Scorecard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }));

      this.setState({
        users: usersList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {

    return (
      <div>
        <h1>Scorecard</h1>

        <AutoCompleteText /> 
        <AutoCompleteText />
        <AutoCompleteText /> 
        <AutoCompleteText />
        <AutoCompleteText /> 
        <AutoCompleteText />
      </div>
    );
  }
}


export default withFirebase(Scorecard);
