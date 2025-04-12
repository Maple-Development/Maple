import { Settings } from './fetch';
let webhookEnabled = false;
let webhookURL = '';

let webhookSettings = new Settings('webhook');

webhookEnabled = webhookSettings.get('enabled') !== null ? webhookSettings.get('enabled') : webhookEnabled;
webhookURL = webhookSettings.get('url') !== null ? webhookSettings.get('url') : webhookURL;

let p2p = true;
let devMode = false;
let showLogging = false;
let socket = true;
let discord = false;

let preferences = new Settings('preferences');
p2p = preferences.get('p2p') !== null ? preferences.get('p2p') : p2p;
devMode = preferences.get('devMode') !== null ? preferences.get('devMode') : devMode;
showLogging = preferences.get('showLogging') !== null ? preferences.get('showLogging') : showLogging;
socket = preferences.get('socket') !== null ? preferences.get('socket') : socket;
discord = preferences.get('discord') !== null ? preferences.get('discord') : discord;

const UserSettings = {
	webhook: {
		enabled: webhookEnabled,
		url: webhookURL
	},
	preferences: {
		p2p,
		devMode,
		showLogging,
		socket,
		discord
	}
};

export default UserSettings;
