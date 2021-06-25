import { Logger } from './libs/logger.cjs';

Logger.info("Hello discord's world !");

// GET DATA FOLDER
const PMR_MODULES = process.env.PMR_MODULES || process.cwd();
Logger.debug("Modules path :" + PMR_MODULES)

// GET CONFIG
const CONFIG = (await import(PMR_MODULES + '/config.js')).default;
console.log(CONFIG);
if(!Object.prototype.hasOwnProperty.call(CONFIG,"token")){
    Logger.error("Missing Config fields (bot username or token) !")
    process.exit(0);
}

// DISCORD BOT
import { Client } from 'discord.js';
const client = new Client();
try {
    // STARTING BOT
    Logger.debug("Discord client connecting ...")
    await client.login(CONFIG.token);
    Logger.info("Discord client connected ...")

} catch (error) {
    Logger.error("ERROR during bot init phase :", error);
    process.exit(1);
}
