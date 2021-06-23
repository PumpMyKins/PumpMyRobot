import { Logger } from './libs/logger.cjs';

Logger.info("Hello discord's world !");

// Validate config file
import Config from './config.js';
if(!Object.prototype.hasOwnProperty.call(Config,"token")){
    Logger.error("Missing Config fields (bot username or token) !")
    process.exit(0);
}
// Start discord client instance
import { Client } from 'discord.js';
const client = new Client();
try {
    // STARTING BOT
    Logger.debug("Discord client connecting ...")
    await client.login(Config.token);
    Logger.info("Discord client connected ...")

} catch (error) {
    Logger.error("ERROR during bot init phase :", error);
    process.exit(1);
}
