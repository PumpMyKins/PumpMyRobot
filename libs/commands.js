import { Validator } from "./validator.js";
import CommandExample from "../command.example.js";
import { Logger } from './logger.cjs';

class Command {
    constructor(moduleName, command){
        this.mod_name = moduleName;
        this.object = command;
    }

    async discordRegister(){
        console.log(this.name + " discord register");
    }

    async discordUnregister(){
        console.log(this.name + " discord unregister");
    }

    async interact(manager, interaction){
        await this.object.interact(manager, interaction);
    }

    get module_name(){
        return this.mod_name;
    }

    get name(){
        return this.object.name;
    }

    get id(){
        return this.cmd.id;
    }

    set discord_cmd(cmd){
        this.cmd = cmd;
    }

    get discord_cmd(){
        return this.cmd;
    }

    get global(){
        return !Object.prototype.hasOwnProperty.call(this.object, "guild");
    }

    get guild(){
        return this.object.guild;
    }

    get defaultPermission(){
        return this.object.permissions.length == 0;
    }

    get data(){
        return {
            name: this.object.name,
			description: this.object.description,
            options: this.object.options,
            defaultPermission: this.defaultPermission,
        };
    }

    get permissions(){
        return this.object.permissions;
    }
}

export class CommandsManager {
    
    constructor(manager){
        this.manager = manager;

        this.cmds = new Map();
    }
    
    //////// COMMANDS UN/LOAD METHODS ////////
    
    async registerCommands(){ // CALL REGISTER FUNCTION OF EACH COMMAND
        await this.cmds.forEach(async command => {
            try {
                Logger.debug("Calling register discord function on " + command.name + " command.")
                await command.discordRegister(); // REGISTER SLASH COMMAND ON DISCORD
                Logger.info(command.name + " command adding on discord's app.")
            } catch (error) {
                Logger.error("Error during " + command.name + " command discord registering...");
                Logger.error(error.stack);
                this.unregister(command.name); // REMOVE COMMAND FROM MANAGER
                Logger.warn(command.name + " command removed from discord's app.");
            }
        });
    }

    async unregisterCommands(){ // CALL UNREGISTER FUNCTION OF EACH COMMAND
        await this.cmds.forEach(async command => {
            try {
                Logger.debug("Calling unregister discord function on " + command.name + " command.")
                await command.discordUnregister(); // UNREGISTER SLASH COMMAND ON DISCORD
            } catch (error) {
                Logger.error("Error during " + command.name + " command discord registering...");
                Logger.error(error.stack);
            }
            this.unregister(command.name);
            Logger.info(command.name + " command removed from discord's app.");
        });
    }

    //////// COMMANDS UTILS METHODS ////////

    exist(commandName){
        return this.cmds.has(commandName);
    }

    get(commandName){
        return this.cmds.get(commandName);
    }

    _validateCommand(command){
        if(!command){
            throw new Error("Undefined command");
        }
        Validator.fromObject(CommandExample).validate(command); // CREATE VALIDATOR FROM EXAMPLE OBJECT
    }

    //////// COMMANDS UN/REGISTER METHODS ////////

    async register(moduleName, command){
        this._validateCommand(command); // VALIDATE COMMAND OBJECT

        if(this.exist(command.name)){
            throw new CommandAlreadyHandleError(command);
        }

        const cmd = new Command(moduleName, command);

        this.cmds.set(command.name,cmd); // ADDING COMMAND
    }

    async unregister(command){
        this._validateCommand(command); // VALIDATE COMMAND OBJECT

        if(!this.exist(command.name)){
            Logger.warn("Can't remove Undefined command[" + command.name + "]");
            return;
        }

        this.cmds.delete(command.name);
    }

    //////// COMMANDS MAP GETTER ////////

    get commands(){
        return this.cmds;
    }

    //////// MODULES METHODS ////////

    getCommandsModuleManager(moduleManager){
        return new CommandsModuleManager(this, moduleManager);
    }

}

export class CommandsModuleManager {
    constructor(manager, name){
        this.manager = manager;
        this.mod_name = name;
    }

    get module_name(){
        return this.mod_name;
    }

    async register(command){
        await this.manager.register(this.module_name, command);
    }

    async unregister(command){
        await this.manager.unregister(command);
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