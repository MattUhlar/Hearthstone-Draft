import Backbone from 'backbone';
const template = require("../test.hbs");

export const LobbyPresenter = Backbone.View.extend({
  el: 'body',
  render: function() {
		this.$el.append(template({ test: "IT WORKED" }));
  },
	showMessage: function(message) {
		this.$el.append(template({test: message}));
	}
});
