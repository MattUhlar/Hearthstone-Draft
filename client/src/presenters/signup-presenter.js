import Backbone from 'backbone';
const template = require('../partials/signup.hbs');

export const SignUpPresenter = Backbone.View.extend({
  el: '#content',
  render: function() {
    this.$el.html(template());
  },
});

