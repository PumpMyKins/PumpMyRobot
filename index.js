import { Logger } from './libs/logger.cjs';

Logger.info("Hello discord's world !");

// GET DATA FOLDER
const PMR_MODULES = getPumpMyRobotDataPath();
Logger.debug("Modules path : " + PMR_MODULES)

// GET CONFIG
const CONFIG = (await import(PMR_MODULES + '/config.js')).default;
if(!Object.prototype.hasOwnProperty.call(CONFIG,"token")){
    Logger.error("Missing Config fields (token) !")
    process.exit(0);
}

// MANAGER
import { PumpMyManager } from './manager.js';
const manager = new PumpMyManager();

// MODULES LOADER
import * as fs from 'fs';
import * as path from 'path';
import loader from './loader.js';

const files = fs.readdirSync(PMR_MODULES);
files.map(function (file) {
    return path.join(PMR_MODULES, file);
}).filter(function (file) {
    return fs.statSync(file).isDirectory();
}).forEach(function (folder) {
    try {   // TRY TO LOAD FOLDER AS MODULE
        const module = loader.load(folder);
        manager.addModule(module);
    } catch (error) {
        // TODO: HANDLE ERROR
    }
});

// DISCORD BOT
import { Client } from 'discord.js';
const client = new Client({ intents: manager.intents });
try {

    // ASYNC WAIT READY
    client.on('ready', async () => {
        Logger.info("Discord client connected !");

        // SET MANAGER CLIENT INSTANCE
        manager.client = client;

        // TODO: SYNC ENABLE MODULES
    });

    // STARTING BOT CONNECTION
    Logger.debug("Discord client connecting ...")
    await client.login(CONFIG.token);

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