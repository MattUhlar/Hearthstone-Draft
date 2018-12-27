import Backbone from 'backbone';
import {Game} from '../collections/open-games';
import {GamePresenter} from './game-presenter';

const template = require('../partials/open-game.hbs');
const _ = require('underscore');

export const OpenGameView = Backbone.View.extend({
  tagName: 'li',

  render: function() {
    this.$el.html(template({
      creator: this.model.get('creator'),
      gameId: this.model.get('gameId')
    }));

    return this;
  },
});
