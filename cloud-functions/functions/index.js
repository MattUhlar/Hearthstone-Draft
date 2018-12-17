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
	let collection_id = '#tab-' + className.toLowerCase();
	let $ = cheerio.load(hearthPwnHtml);

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

function buildQueriesForClassCards(classNames) {
	return _.map(classNames, className => db.collection(`${className.toLowerCase()}-cards`).get());
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

	let username = request.body.username;
	let classes = request.body.classes;

	if (request.method === 'POST') {
		console.log('got post request');
		console.log(request);
		console.log(request.body);
		console.log(username);
		console.log(classes);
	}

	getUserCollectionFromHearthPwn(username).then(res => {
		let user_owned_cardnames = getUserOwnedCardNamesForClasses(res.data, classes);
		let firestore_card_queries = buildQueriesForClassCards(classes);
		return Promise.all([user_owned_cardnames, Promise.all(firestore_card_queries)]);

	}).then(res => {
		let user_owned_cardnames = res[0];
		let class_cards_snapshots = res[1];

		let class_cards = _.chain(class_cards_snapshots)
			.map(snapshot => snapshot.docs)
			.flatten()
			.map(doc => doc.data())
			.value();

		let card_name_to_card_map = _.reduce(class_cards, (memo, card) => {
			memo[card.name] = card; 
			return memo
		}, {});

		let user_owned_cards = _.map(user_owned_cardnames, cardname => card_name_to_card_map[cardname]);

		response.status(200).send(JSON.stringify(user_owned_cards));
		return;

	}).catch(err => {
		console.log(err)
		response.status(500).send();
	});

});
