import Backbone from 'backbone';

export const GamePresenter = Backbone.View.extend({
  el: 'body',
  render: function() {
    console.log("IM BEING RENDERED: GamePresenter");
  }
});
