import { Logger } from './libs/logger.cjs';

Logger.info("Hello discord's world !");

import { getConfig, getPumpMyRobotDataPath, getPumpMyRobotWorkPath } from './libs/data.js';
// GET DATA FOLDER
const PMR_MODULES = getPumpMyRobotDataPath();
Logger.debug("Modules path : " + PMR_MODULES)
// GET CONFIG
const CONFIG = await getConfig();

// MANAGER
import { PumpMyManager } from './libs/manager.js';
const manager = new PumpMyManager();

// MODULES LOADER
import * as fs from 'fs';
import * as path from 'path';
import loader, { NoModuleEntrypointFoundError } from './libs/loader.js';

const workdir = getPumpMyRobotWorkPath();
if(PMR_MODULES != workdir){
    Logger.debug("Adding built-int module");
    await loadModule(path.join(workdir, "builtin_module"));
}

Logger.debug("Starting modules loading process...");
const folders = fs.readdirSync(PMR_MODULES).map( file => path.join(PMR_MODULES, file)).filter( file => fs.statSync(file).isDirectory());
for (const i in folders) {
    try {   // TRY TO LOAD FOLDER AS MODULE
        await loadModule(folders[i]);
    } catch (error) {
        if(error instanceof NoModuleEntrypointFoundError){
            Logger.warn(error.message);
        }else{
            Logger.error("Error during " + folders[i] + " importing process :\n" + error.stack);
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

        // SYNC ENABLE MODULES
        await manager.loadModules();

        // SYNC ENABLE COMMANDS
        await manager.cmds.registerCommands();
    });

    // ASYNC ON INTERACTION
    const cmds = manager.commands;
    client.on("interaction", async (interaction) => {
        if(!interaction.isCommand()){return;} // ONLY HANDLE COMMANDS

        const commandName = interaction.commandName;
        if(!cmds.exist(commandName)){ // COMMAND NOT FOUND
            Logger.error("Interaction Command \"" + commandName + "\" not found.")
            return;
        }

        const command = cmds.get(commandName);
        // COMMAND FOUND
        try {
            command.interact(manager.getModuleManager(command.module), interaction);
        } catch (error) {
            Logger.error("Error during " + commandName + " interaction...");
            Logger.error(error.stack);
        }      
    });

    // STARTING BOT CONNECTION
    Logger.debug("Discord client connecting ...")
    await client.login(CONFIG.token);

} catch (error) {
    Logger.error("ERROR during bot init phase :", error);
    process.exit(1);
}

async function loadModule(folder){
    const module = await loader.load(folder);
    manager.addModule(module);
    Logger.info("Manager now handle \"" + module.name + "\" module.");
}