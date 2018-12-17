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

// TODO: Validate / handle errors
exports.getCards = functions.https.onRequest((request, response) => {
	let username = request.body.username;
	let classes = request.body.classes;

	getUserCollectionFromHearthPwn(username).then(res => {
			let user_owned_cardnames = getUserOwnedCardNamesForClasses(res.data, classes);
			let firestore_card_queries = _.map(user_owned_cardnames, cardname => db.collection('cards').doc(cardname).get());
			return Promise.all(firestore_card_queries);

	}).then(snaps => {
		let user_owned_cards = _.map(snaps, snap => snap.data());
		response.status(200).send(JSON.stringify(user_owned_cards));
		return;

	}).catch(err => {
		console.log(err)
		response.status(500).send();
	});
});
