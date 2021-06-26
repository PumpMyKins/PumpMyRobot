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
import { PumpMyManager } from './libs/manager.js';
const manager = new PumpMyManager();

// MODULES LOADER
import * as fs from 'fs';
import * as path from 'path';
import loader, { NoModuleEntrypointFoundError } from './libs/loader.js';

Logger.debug("Starting modules loading process...");
const folders = fs.readdirSync(PMR_MODULES).map( file => path.join(PMR_MODULES, file)).filter( file => fs.statSync(file).isDirectory());
for (const i in folders) {
    try {   // TRY TO LOAD FOLDER AS MODULE
        const module = await loader.load(folders[i]);
        manager.addModule(module);
        Logger.info("Manager now handle \"" + module.name + "\" module.");
    } catch (error) {
        if(error instanceof NoModuleEntrypointFoundError){
            Logger.warn(error.message);
        }else{
            Logger.error(error.stack);
        }
    }
}
Logger.debug("Modules loading process finished...");

if(manager.countModules < 1){ // NO MODULE
    Logger.warn("No module found, stopping bot.");
    Logger.warn("Add valid module in PMR_MODULES path : " + PMR_MODULES);
    process.exit(0);
}

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