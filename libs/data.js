import { Logger } from './logger.cjs';

export function getPumpMyRobotDataPath() {
    const path = process.env.PMR_MODULES || process.cwd();
    if (path.endsWith('/')) {
        return path;
    }
    return path + "/";
}

export async function getConfig() {
    const CONFIG = (await import(getPumpMyRobotDataPath() + '/config.js')).default;
    if (!Object.prototype.hasOwnProperty.call(CONFIG, "token") || !Object.prototype.hasOwnProperty.call(CONFIG, "user_can_module") || !Object.prototype.hasOwnProperty.call(CONFIG, "role_can_module")) {
        Logger.error("Missing Config fields (token/user_can_module/role_can_module) !")
        process.exit(0);
    }
    return CONFIG;
}