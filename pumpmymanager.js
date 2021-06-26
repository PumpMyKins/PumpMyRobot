import { Logger } from './libs/logger.cjs';
import { Intents } from "discord.js";

export class PumpMyManager {

    constructor() {
        this.client = null;

        this.modules = new Map();
    }

    //////// CLIENT METHODS ////////
    setClient(c){
        this.client = c;
    }

    getClient(){
        if(this.client == null) { // throw error if client not init yet
            throw new Error("Discord Client not ready yet.");
        }
        return this.client;
    }
    
    //////// INTENTS METHODS ////////
    getIntents(){
        const intentsList = new Array(); // push intent if not already contains in the array
        this.modules.forEach((_, module) => {
            if(module.intents == null) {
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

}