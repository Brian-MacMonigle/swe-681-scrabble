import firebase from 'firebase'
const config = {
    apiKey: "AIzaSyALcdezyKzfpmXNlMzunNpzwpP_lx_V7Yw",
    authDomain: "swe-681-scrabble.firebaseapp.com",
    databaseURL: "https://swe-681-scrabble.firebaseio.com",
    projectId: "swe-681-scrabble",
    storageBucket: "swe-681-scrabble.appspot.com",
    messagingSenderId: "1012676198612"
};
firebase.initializeApp(config);
export default firebase;