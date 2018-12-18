'use strict';

const functions = require('firebase-functions');
const firebase = require("firebase/app");
const firestore = require("firebase/firestore");

const cheerio = require('cheerio');
const axios = require('axios');
const _ = require('underscore');

const HEARTHPWN_BASE_URL = 'https://www.hearthpwn.com/members/';

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

const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

function getUserCollectionFromHearthPwn(username) {
	return axios.get(HEARTHPWN_BASE_URL + username + '/collection')
}

function getUserOwnedCardNamesForClass(hearthPwnHtml, className) {
	const collection_id = '#tab-' + className.toLowerCase();
	const $ = cheerio.load(hearthPwnHtml);

	return $(collection_id).find($('.owns-card')).map(function(idx, el) {
		return $(this).data()['cardName'];
	}).get();
}

function getUserOwnedCardNamesForClasses(hearthPwnHtml, classNames) {
	return _.chain(classNames)
		.map(className => getUserOwnedCardNamesForClass(hearthPwnHtml, className))
		.flatten()
		.unique()
		.value();
}

function getClassCardsFromDB(classNames) {
	return Promise.all(
    _.map(classNames, className => db.collection(`${className.toLowerCase()}-cards`).get())
  );
}

// TODO: Validate / handle errors
exports.getCards = functions.https.onRequest((request, response) => {

	response.set('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
		return;
  } 

	const username = request.body.username;
	const classes = request.body.classes;

	if (request.method === 'POST') {
		console.log('got post request');
		console.log(request);
		console.log(request.body);
		console.log(username);
		console.log(classes);
	}

  Promise.all([
    getUserCollectionFromHearthPwn(username),
    getClassCardsFromDB(classes)
  ]).then(([user_collection, class_cards_snapshots]) => {

	  const user_owned_cardnames = getUserOwnedCardNamesForClasses(user_collection.data, classes);
		const class_cards = _.chain(class_cards_snapshots)
			.map(snapshot => snapshot.docs)
			.flatten()
			.map(doc => doc.data())
			.value();

		const card_name_to_card_map = _.reduce(class_cards, (memo, card) => _.extend(memo, {[card.name]: card}), {});
		const user_owned_cards = _.map(user_owned_cardnames, cardname => card_name_to_card_map[cardname]);

		response.status(200).send(JSON.stringify(user_owned_cards));
		return;
  })
  .catch(err => {
		console.log(err)
		response.status(500).send();
  });
});
