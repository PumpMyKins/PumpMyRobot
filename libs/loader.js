import * as fs from 'fs';
import * as path from 'path';

export default {
    async load(folder) {
        const files = fs.readdirSync(folder).map(file => path.join(folder, file)).filter(file => fs.statSync(file).isFile() && file.endsWith(".romod.js"));
        const romodCount = files.length;
        
        if(romodCount == 0){
            throw new NoModuleEntrypointFoundError(folder);
        }else if(romodCount == 1){
            return (await import(files[0])).default;
        }else {
            throw new MultipleModuleEntrypointError(folder);
        }
    }
}

export class MultipleModuleEntrypointError extends Error {
    constructor(folder){
        super("Multiple .romod.js entrypoints found in the module folder : " + folder);
        this.f = folder;
    }

    get folder(){
        return this.f;
    }
}

export class NoModuleEntrypointFoundError extends Error {
    constructor(folder){
        super("No .romod.js entrypoint found in the module folder : " + folder);
        this.f = folder;
    }

    get folder(){
        return this.f;
    }
}