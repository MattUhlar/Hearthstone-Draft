import Backbone from 'backbone';
const _ = require('underscore');

export const Game = Backbone.Model.extend({
  initialize: function(options) {
    this.creator = options.creator;
    this.joiner = options.joiner;
    this.gameRef = options.gameRef;
    this.gameRef.on('child_added', _.bind(this.handleUpdate, this));
  },

  handleUpdate: function(snapshot) {
    switch(snapshot.key) {
      case 'joiner':
        this.set({'joiner': snapshot.val()});
        break;

      case 'creator':
        this.set({'creator': snapshot.val()});
        break;
    }

    console.log(this);
    this.trigger('change', this);
  }
});

export const OpenGame = Backbone.Model.extend({

});

export const OpenGames = Backbone.Collection.extend({
  model: OpenGame,

  initialize: function(models, options) {
    this.ref = options.ref;
    this.ref.on('child_added', _.bind(this.updateGames, this));
  },

  updateGames: function(snapshot, prevChildKey) {
    this.add(new OpenGame({
      gameId: snapshot.key,
      creator: snapshot.val().creator
    }));
  },

  addGame: function(gameData) {
    const newGameRef = this.ref.push();
    newGameRef.set(gameData);
  }
});

