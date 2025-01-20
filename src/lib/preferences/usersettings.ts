import { Settings } from "./fetch";
let webhookEnabled = "true";
let webhookURL = "https://discord.com/api/webhooks/1329929073471782912/HCAg7p2paoG1xLMUY_0u9zZfaEvRRvsbKxlcQxOGN6ZAMDYfhL068L68bIAaBu_p7hLz";


let webhookSettings = new Settings('webhook');

webhookEnabled = webhookSettings.get('enabled') || webhookEnabled;
webhookURL = webhookSettings.get('url') || webhookURL;

const UserSettings = {
    webhook: {
        enabled: webhookEnabled,
        url: webhookURL
    }
}

export default UserSettings

