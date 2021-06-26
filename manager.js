import { Logger } from './libs/logger.cjs';
import { Intents } from "discord.js";

export class PumpMyManager {

    constructor() {
        this.discord_client = null;

        this.modules = new Map();
    }

    //////// CLIENT METHODS ////////
    set client(c){
        this.discord_client = c;
    }

    get client(){
        if(this.client == null) { // throw error if client not init yet
            throw new Error("Discord Client not ready yet.");
        }
        return this.client;
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

    //////// MODULES METHODS ////////

    addModule(module){
        if(!module){
            throw new Error("Undefined module");
        } else if(this.modules.has(module.name)){
            throw new ModuleAlreadyHandleError(module);
        }
        this.modules.set(module.name,module); // ADDING MODULE
    }

    get countModules(){
        return this.modules.size;
    }

}

export class ModuleAlreadyHandleError extends Error {
    constructor(module){
        super("The module \"" + module.name + "\" already handle by manager.");
        this.module = module;
    }

    getModule(){
        return this.module;
    }

}