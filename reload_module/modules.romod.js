import ReloadCmd, { getConfigPermissions } from './modules.cmd.js';

export default {
    name: "builtin_MODULE",
    intents: ["GUILD_PRESENCES", "GUILD_MEMBERS"],
    load(manager) {
        manager.LOGGER.info("Loading RELOAD module : add module command...");

        ReloadCmd.permissions = getConfigPermissions(); // SET PERMISSION
        console.log(ReloadCmd);
        manager.CMD.register(ReloadCmd); // REGISTER COMMAND
    },
    unload(manager) {
        manager.LOGGER.info("Unloading RELOAD module : remove module command...");
        manager.CMD.unregister(ReloadCmd); // UNREGISTER COMMAND
    }
}