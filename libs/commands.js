export class CommandsManager {
    
    getCommandsModuleManager(name){
        return new CommandsModuleManager(this, name);
    }

}

export class CommandsModuleManager {
    constructor(manager, name){
        this.manager = manager;
        this.name = name;
    }

    register(){

    }

    unregister(){
        
    }
}