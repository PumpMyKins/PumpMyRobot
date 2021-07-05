import { Logger } from './logger.cjs';
import ConfigExample from '../config.example.js';
import { Validator } from './validator.js';


export function getPumpMyRobotDataPath() {
    const path = process.env.PMR_MODULES || process.cwd();
    return completePath(path);
}

export function getPumpMyRobotWorkPath(){
    return completePath(process.cwd());
}

function completePath(path){
    if (path.endsWith('/')) {
        return path;
    }
    return path + "/";
}

export async function getConfig() {
    const CONFIG = (await import(getPumpMyRobotDataPath() + '/config.js')).default;
    // VALIDATE FROM CONFIG EXAMPLE
    let validator = Validator.fromObject(ConfigExample);
    validator.validate(CONFIG);

    return CONFIG;
}