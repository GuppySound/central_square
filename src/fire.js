import firebase from 'firebase'
const firebaseConfig = {
    apiKey: "AIzaSyBFrHnougpd1ZvJgMHqJE73Yp_Q-mmHdnA",
    authDomain: "iconic-hue-273619.firebaseapp.com",
    databaseURL: "https://iconic-hue-273619.firebaseio.com",
    projectId: "iconic-hue-273619",
    storageBucket: "iconic-hue-273619.appspot.com",
    messagingSenderId: "851778095224",
    appId: "1:851778095224:web:dd3903b820a89262ab458d",
    measurementId: "G-BQ7LXJ6JGY"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
export default db;
