import { Settings } from './fetch';
let webhookEnabled = true;
let webhookURL =
	'https://discord.com/api/webhooks/1329929073471782912/HCAg7p2paoG1xLMUY_0u9zZfaEvRRvsbKxlcQxOGN6ZAMDYfhL068L68bIAaBu_p7hLz';

let webhookSettings = new Settings('webhook');

webhookEnabled = webhookSettings.get('enabled') || webhookEnabled;
webhookURL = webhookSettings.get('url') || webhookURL;

let p2p = true;
let devMode = false;
let showLogging = false;
let socket = true;

let preferences = new Settings('preferences');
p2p = preferences.get('p2p') !== null ? preferences.get('p2p') : p2p;
devMode = preferences.get('devMode') !== null ? preferences.get('devMode') : devMode;
showLogging = preferences.get('showLogging') !== null ? preferences.get('showLogging') : showLogging;
socket = preferences.get('socket') !== null ? preferences.get('socket') : socket;

const UserSettings = {
	webhook: {
		enabled: webhookEnabled,
		url: webhookURL
	},
	preferences: {
		p2p,
		devMode,
		showLogging,
		socket
	}
};

export default UserSettings;
