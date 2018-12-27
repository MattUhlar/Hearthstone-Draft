import Backbone from 'backbone';
const template = require('../partials/game.hbs');
const _ = require('underscore');

export const GamePresenter = Backbone.View.extend({
  el: 'body',
  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },
  render: function() {
    this.$el.empty().append(template({
      creator: this.model.get('creator'),
      gameOpen: _.isUndefined(this.model.get('joiner')),
      joiner: this.model.get('joiner')
    }));

    return this;
  },

  remove: function() {
    this.$el.empty().off();
    this.stopListening();
    return this;
  },

});
