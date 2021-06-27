export default {
    name: "modules",
    description: "List/reload modules.",
    defaultPermission: false,
    permissions: [],
    options: [{
        name: 'ls',
        type: 'SUB_COMMAND',
        description: "List all modules"
    },
    {
        name: 'reload',
        type: 'SUB_COMMAND',
        description: "Reload specific module.",
        options: [{
            name: 'name',
            type: 'STRING',
            description: 'Module name',
            required: true,
        }]
    }],
    interact(manager, interaction){
        manager.LOGGER.info("Command interaction");
    }
}

import { getConfig } from "../libs/data.js";
const Config = await getConfig();

export function getConfigPermissions() {
    const perm = [];
    Config.user_can_module.forEach(user => {
        perm.push({
            id: user,
            type: 'USER',
            permission: true,
        });
    });
    Config.role_can_module.forEach(role => {
        perm.push({
            id: role,
            type: 'ROLE',
            permission: true,
        });
    });
    return perm;
}

// TODO: sub command ls
// TODO: sub command reload