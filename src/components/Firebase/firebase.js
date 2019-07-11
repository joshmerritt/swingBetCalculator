import app from 'firebase/app';
import 'firebase/auth';

/*
const firebaseConfig = {
  apiKey: "AIzaSyB3WjAf5H56lhBdeL3RCchMJhQ1CSbQhTw",
  authDomain: "swingbetgolfcalculator.firebaseapp.com",
  databaseURL: "https://swingbetgolfcalculator.firebaseio.com",
  projectId: "swingbetgolfcalculator",
  storageBucket: "swingbetgolfcalculator.appspot.com",
  messagingSenderId: "285845045987",
  appId: "1:285845045987:web:932d249ed9a70562"
};
*/

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    this.auth = app.auth();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
}

export default Firebase;
