'use strict';

import {LobbyPresenter} from './presenters/lobby';
import {GamePresenter} from './presenters/game';
import 'bootstrap';

const _  = require('underscore');
const firebase = require("firebase/app");
const firestore = require("firebase/firestore");

let lobbyPresenter = new LobbyPresenter();
let gamePresenter = new GamePresenter();

// Initialize firebase
var config = {
	apiKey: "AIzaSyATRgPsNYrPO6UceY0gTLtRWDoWJgmtsbY",
	authDomain: "hearthstone-draft.firebaseapp.com",
	databaseURL: "https://hearthstone-draft.firebaseio.com",
	projectId: "hearthstone-draft",
	storageBucket: "hearthstone-draft.appspot.com",
	messagingSenderId: "90888399507"
};


firebase.initializeApp(config);

const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

db.collection("test").get().then((querySnapshot) => {
	querySnapshot.forEach(doc => {
		console.log(doc.data());
		lobbyPresenter.showMessage(doc.data().message);
	});
});


lobbyPresenter.render();
gamePresenter.render();
