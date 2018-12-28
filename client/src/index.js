'use strict';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

import {LobbyPresenter} from './presenters/lobby-presenter';
import {GamePresenter} from './presenters/game-presenter';
import {LoginPresenter} from './presenters/login-presenter';
import {SignUpPresenter} from './presenters/signup-presenter';

import {OpenGames} from './models/open-games';

const firebase = require("firebase/app");
const firestore = require("firebase/database");
const $ = require('jquery');

// Initialize firebase
const config = {
  apiKey: "AIzaSyATRgPsNYrPO6UceY0gTLtRWDoWJgmtsbY",
  authDomain: "hearthstone-draft.firebaseapp.com",
  databaseURL: "https://hearthstone-draft.firebaseio.com",
  projectId: "hearthstone-draft",
  storageBucket: "hearthstone-draft.appspot.com",
  messagingSenderId: "90888399507"
};

firebase.initializeApp(config);

const db = firebase.database();
const openGamesRef = db.ref('open-games');

const loginPresenter = new LoginPresenter();
loginPresenter.render(); 

$('#confirm-btn').on('click', e => {

  const openGames = new OpenGames(null, {
    ref: openGamesRef
  });

  const lobbyPresenter = new LobbyPresenter({
    collection: openGames,
    db: db,
    username: $('#username-input').val()
  });

  loginPresenter.remove();
  lobbyPresenter.render();
});
