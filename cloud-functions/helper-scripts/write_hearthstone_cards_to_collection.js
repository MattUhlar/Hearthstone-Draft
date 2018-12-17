'use strict';

const _ = require('underscore');
const fs = require('fs');

const firebase = require("firebase/app");
const firestore = require("firebase/firestore");

// Initialize firebase
const config = {
	apiKey: "AIzaSyATRgPsNYrPO6UceY0gTLtRWDoWJgmtsbY",
	authDomain: "hearthstone-draft.firebaseapp.com",
	databaseURL: "https://hearthstone-draft.firebaseio.com",
	projectId: "hearthstone-draft",
	storageBucket: "hearthstone-draft.appspot.com",
	messagingSenderId: "90888399507"
};

const CARD_SETS = [
	"Basic",
	"Classic",
	"Hall of Fame",
	"Naxxramas",
	"Goblins vs Gnomes",
	"Blackrock Mountain",
	"The Grand Tournament",
	"The League of Explorers",
	"Whispers of the Old Gods",
	"One Night in Karazhan",
	"Mean Streets of Gadgetzan",
	"Journey to Un\'Goro",
	"Knights of the Frozen Throne",
	"Kobolds & Catacombs",
	"The Witchwood",
	"The Boomsday Project",
	"Rastakhan\'s Rumble",
];

const CLASS_CARDS_MAP = {
	'Druid': [],
	'Hunter': [],
	'Mage': [],
	'Paladin': [],
	'Priest': [],
	'Rogue': [],
	'Shaman': [],
	'Warlock': [],
	'Warrior': [],
	'Neutral': []
};

firebase.initializeApp(config);

const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

function buildCardObj(card) {
	let obj =  {
		cardId: card.cardId,
		dbfId: card.dbfId,
		name: card.name,
		cardSet: card.cardSet,
		type: card.type,
		rarity: card.rarity,
		cost: card.cost,
		playerClass: card.playerClass,
		img: card.img,
		imgGold: card.imgGold,
		locale: card.locale
	};

	if (card.faction) {
		obj.faction = card.faction
	}

	if (card.mechanics) {
		obj.mechanics = card.mechanics;
	}

	return obj;
}

fs.readFile('cards.json', 'utf-8', (err, contents) => {
	contents = JSON.parse(contents.trim());

	let cards = _.flatten(_.map(CARD_SETS, card_set => contents[card_set]));
	cards.forEach(card => CLASS_CARDS_MAP[card.playerClass].push(buildCardObj(card)));


	for (let key in CLASS_CARDS_MAP) {
		let collection_name = `${key.toLowerCase()}-cards`;

		CLASS_CARDS_MAP[key].forEach(card => {
			db.collection(collection_name).doc(card.name).set(card);
		});
	}
});
