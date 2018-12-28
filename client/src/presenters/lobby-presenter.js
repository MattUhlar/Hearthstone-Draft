import Backbone from 'backbone';
import {OpenGameView} from './open-game-presenter';
import {GamePresenter} from './game-presenter';
import {Game} from '../models/games';

const _ = require('underscore');
const template = require('../partials/lobby.hbs');
const $ = require('jquery');

export const LobbyPresenter = Backbone.View.extend({
  el: 'body',

  events: {
    'click #create-game-btn': 'createGame',
    'click .join-btn': 'joinGame'
  },

  initialize: function(options) {
    this.lobbyActive = false;

    this.listenTo(this.collection, 'add', this.addGame);
    this.db = options.db;
    this.username = options.username;
  },

  render: function() {
    this.lobbyActive = true;

    this.$el.append(template());

    _.each(this.collection.models, model => this.displayOpenGame(new OpenGameView({model: model})));

    return this;
  },

  remove: function() {
    this.$el.empty().off();
    this.stopListening();
    return this;
  },

  displayOpenGame: function(gameView) {
    $('#open-games-list').append(gameView.render().el);
  },

  createGame: function() {
    const gameRef = this.db.ref('open-games').push();
    const gameId = gameRef.key;
    gameRef.set({creator: this.username});

    const game = new Game({creator: this.username, gameRef: gameRef});
    this.displayGame(game);
  },

  displayGame: function(game) {
    const gameView = new GamePresenter({model: game});
    this.remove();
    gameView.render();
  },

  addGame: function(openGame) {
    if (!this.lobbyActive) {
      return;
    }

    this.displayOpenGame(new OpenGameView({model: openGame}));
  },

  joinGame: function(e) {
    const currentTarget = $(e.currentTarget);
    const gameId = currentTarget.data('game-id');
    const gameRef = this.db.ref('open-games/' + gameId);

    gameRef.once('value', data => {
      const gameData = data.val();
      gameData.joiner = this.username;
      gameRef.set(gameData);
      console.log(gameData);

      const game = new Game({
        creator: data.val().creator,
        joiner: this.username, 
        gameRef: gameRef
      });
      this.displayGame(game);
    });
  }
});
