import ReloadCmd, { getConfigPermissions } from './modules.cmd.js';

export default {
    name: "builtin_MODULE",
    description: "builtin modules command",
    intents: ["GUILD_PRESENCES", "GUILD_MEMBERS"],
    async load(manager) {
        manager.LOGGER.info("Loading : add module command...");

        ReloadCmd.permissions = getConfigPermissions(); // SET PERMISSION
        await manager.CMD.register(ReloadCmd); // REGISTER COMMAND
    },
    async unload(manager) {
        manager.LOGGER.info("Unloading : remove module command...");
        await manager.CMD.unregister(ReloadCmd); // UNREGISTER COMMAND
    }
}