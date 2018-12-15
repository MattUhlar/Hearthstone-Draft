import Backbone from 'backbone';

export const LobbyPresenter = Backbone.View.extend({
  el: 'body',
  render: function() {
    console.log("IM BEING RENDERED: LobbyPresenter");
  }
});
