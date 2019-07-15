import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [{name: '', display: '(Select player)'}],
      selectedTeam: '',
    };
  }

  componentDidMount() {
    this.props.firebase.users().on('value', snapshot => {
      const currentUsers = snapshot.val();
      const playerList = this.state.users;
      for(let item in currentUsers) {
        playerList.push({
          id: item,
          name: currentUsers[item].username,
          handicap: currentUsers[item].handicap          
          })
      }
      this.setState({
        users: playerList,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    // const { users, loading } = this.state;

    return (
      
      <div>
        {this.state.users}
      </div>
    );
  }
}


export default withFirebase(PlayerList);
