import { Validator } from "./validator.js";
import CommandExample from "../command.example.js";

export class CommandsManager {
    
    constructor(manager){
        this.manager = manager;

        this.cmds = new Map();
    }

    exist(commandName){
        return this.cmds.has(commandName);
    }

    get(commandName){
        return this.cmds.get(commandName);
    }

    _validateCommand(command){
        Validator.fromObject(CommandExample).validate(command); // CREATE VALIDATOR FROM EXAMPLE OBJECT
    }

    register(command){
        if(!command){
            throw new Error("Undefined command");
        } 

        this._validateCommand(command); // VALIDATE COMMAND OBJECT

        if(this.exist(command.name)){
            throw new CommandAlreadyHandleError(command);
        }
        this.cmds.set(command.name,command); // ADDING COMMAND

        // TODO : discord create interaction
        // TODO : discord set interaction's permissions
    }

    unregister(commandName){
        if(!this.exist(commandName)){
            throw new Error("Can't remove Undefined command[" + commandName + "]");
        }
        // TODO : discord delete interaction
        this.cmds.delete(commandName);
    }

    //////// MODULES METHODS ////////

    getCommandsModuleManager(name){
        return new CommandsModuleManager(this, name);
    }

}

export class CommandsModuleManager {
    constructor(manager, name){
        this.manager = manager;
        this.name = name;
    }

    register(command){
        this.manager.register(command);
    }

    unregister(commandName){
        this.manager.unregister(commandName);
    }
}

export class CommandAlreadyHandleError extends Error {
    constructor(command){
        super("The command \"" + command.name + "\" already handle by manager.");
        this.command = command;
    }

    get command(){
        return this.command;
    }

}