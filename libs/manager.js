import { Logger, ModuleLogger } from './logger.cjs';
import { CommandsManager } from './commands.js';
import { Intents } from "discord.js";
import { Validator } from './validator.js';
import RomodExample from '../example.romod.js';

export class PumpMyManager {

    constructor() {
        this.discord_client = null;

        this.mods = new Map();
        this.cmds = new CommandsManager(this);
    }

    //////// CLIENT METHODS ////////
    set client(c){
        this.discord_client = c;
    }

    get client(){
        if(this.discord_client == null) { // throw error if client not init yet
            throw new Error("Discord Client not ready yet.");
        }
        return this.discord_client;
    }
    
    //////// INTENTS METHODS ////////
    get intents(){
        const intentsList = new Array(); // push intent if not already contains in the array
        this.modules.forEach((module, _) => {
            if(!Object.prototype.hasOwnProperty.call(module, "intents") || module.intents == null || module.intents.size == 0) {
                Logger.warn("No specified intents for \"" + module.name + "\" module.");
            }else {
                module.intents.forEach(intent => {
                    if(!intentsList.includes(intent)){
                        intentsList.push(intent);
                    }
                });
            }
        });
        const intents = new Intents
        intents.add(intentsList);
        return intents;
    }

    //////// MODULES UN/LOAD METHODS ////////

    async loadModules(){ // CALL LOAD FUNCTION OF EACH MODULES
        await this.modules.forEach(async module => {
            try {
                Logger.debug("Calling load function on " + module.name + " module.")
                await module.load(this.getModuleManager(module.name));
            } catch (error) {
                Logger.error("Error on " + module.name + " module loading function...");
                Logger.error(error.stack);
                this.removeModule(module.name);
                Logger.warn("Module " + module.name + " removed from the manager.");
            }
        });
    }

    async unloadModules(){ // CALL UNLOAD FUNCTION OF EACH MODULES
        await this.modules.forEach(async module => {
            try {
                await module.unload(this.getModuleManager(module.name));
            } catch (error) {
                Logger.error("Error on " + module.name + " module unloading function...");
                Logger.error(error.stack);
            }
            this.removeModule(module.name);
            Logger.info("Module " + module.name + " removed from the manager.");
        });
    }

    //////// MODULES UTILS METHODS ////////

    _validateModule(module){
        Validator.fromObject(RomodExample).validate(module); // CREATE VALIDATOR FROM EXAMPLE OBJECT
    }

    getModuleManager(name){
        return new ModuleManager(this, name);
    }

    //////// MODULES ADD/REMOVE METHODS ////////

    addModule(module){
        if(!module){
            throw new Error("Undefined module");
        } 

        this._validateModule(module); // VALIDATE MODULE OBJECT
        
        if(this.modules.has(module.name)){
            throw new ModuleAlreadyHandleError(module);
        }
        this.modules.set(module.name,module); // ADDING MODULE
    }

    removeModule(name) {
        if(!this.mods.has(name)){
            throw new Error("Can't remove Undefined module[" + name + "]");
        }
        this.mods.delete(name);
    }

    get countModules(){
        return this.mods.size;
    }

    get modules(){
        return this.mods;
    }

    //////// Commands METHODS ////////

    get commands(){
        return this.cmds;
    }
}

export class ModuleManager {
    constructor(manager, name){
        this.manager = manager;
        this.name = name;
    }

    get intents(){
        return this.manager.intents;
    }

    get countModules(){
        return this.manager.countModules;
    }

    get discord(){
        return this.manager.client;
    }

    get LOGGER(){
        return ModuleLogger(this.name); // TODO: custom module LOGGER
    }

    get module_name(){
        return this.name;
    }

    get CMD(){
        return this.manager.commands.getCommandsModuleManager(this.name);
    }
}

export class ModuleAlreadyHandleError extends Error {
    constructor(module){
        super("The module \"" + module.name + "\" already handle by manager.");
        this.module = module;
    }

    get module(){
        return this.module;
    }

}