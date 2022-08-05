
import axios from 'axios';

/**
 * This method send http webhook message to microsoft teams
 * @param {string} webhookUrl - webhook url
 * @param {String} message - message
 */
export const sendWebhookToMicrosoftTeams = async (webhookUrl, message) => {
    try {
        console.log(`sendWebhookToMicrosoftTeams -- Trying to send webhook message: ${message}`);
        const isWebhookSent = await axios.post(webhookUrl, { text: message });
        if (isWebhookSent && isWebhookSent?.status === 200) {
            console.log(`sendWebhookToMicrosoftTeams -- Succeeded to send webhook message: ${message}`);
        } else {
            throw `Failed to send message:${message},Error:${JSON.stringify(isWebhookSent?.response?.data)}`;
        }
    } catch (ex) {
        const err = `sendWebhookToMicrosoftTeams -- Failed to send webhook message: ${message},Error: ${JSON.stringify(ex?.response?.data)}`;
        console.error(err);
        throw err;
    }
};
