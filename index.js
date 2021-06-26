import { Logger } from './libs/logger.cjs';

Logger.info("Hello discord's world !");

// GET DATA FOLDER
const PMR_MODULES = getPumpMyRobotDataPath();
Logger.debug("Modules path :" + PMR_MODULES)

// GET CONFIG
const CONFIG = (await import(PMR_MODULES + '/config.js')).default;
if(!Object.prototype.hasOwnProperty.call(CONFIG,"token")){
    Logger.error("Missing Config fields (token) !")
    process.exit(0);
}

// MANAGER
import { PumpMyManager } from './pumpmymanager.js';
const manager = new PumpMyManager();
// DISCORD BOT
import { Client } from 'discord.js';
const intents = manager.getIntents();
const client = new Client({ ws: { intents: intents } });
try {
    // STARTING BOT
    Logger.debug("Discord client connecting ...")
    await client.login(CONFIG.token);
    Logger.info("Discord client connected ...")

} catch (error) {
    Logger.error("ERROR during bot init phase :", error);
    process.exit(1);
}

function getPumpMyRobotDataPath(){
    const path = process.env.PMR_MODULES || process.cwd();
    if(path.endsWith('/')){
        return path;
    }
    return path + "/";
}