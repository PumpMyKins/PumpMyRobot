export default {
    name: "example",
    description: "example",
    intents: ["GUILD_PRESENCES", "GUILD_MEMBERS"],
    load(manager){
        manager.LOGGER.info("Logging from Example module LOAD state !");
    },
    unload(manager){
        manager.LOGGER.info("Logging from Example module UNLOAD state !");
    }
}