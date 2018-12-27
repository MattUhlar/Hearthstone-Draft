import Backbone from 'backbone';
const template = require('../partials/login.hbs');

export const LoginPresenter = Backbone.View.extend({
  el: '#content',
  render: function() {
    this.$el.html(template());
  },
});

