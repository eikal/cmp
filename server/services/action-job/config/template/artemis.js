import { ACTION_JOB_CONFIG_TYPES, ACTION_JOB_CONFIG_ROLES } from '../config.js';

export const ARTEMIS_ACTION_JOBS_TEMPLATE = {
    name: 'artemis',
    displayName: 'Artemis',
    bt_role: ['elk', 'elasticsearch', 'elastic', 'standalone'],
    description: 'Artemis Actions',
    actions: [
        {
            name: 'artemisRestart',
            displayName: 'Artemis Restart',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Restart Artemis service',
            value: ['sudo systemctl restart artemis.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'artemisStart',
            displayName: 'Artemis Start',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Start Artemis service',
            value: ['sudo systemctl start artemis.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'artemisStop',
            displayName: 'Artemis Stop',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Stop Artemis service',
            value: ['sudo systemctl stop artemis.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'artemisStatus',
            displayName: 'Artemis Status',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Artemis Service status',
            value: ['sudo systemctl status artemis.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        },
        {
            name: 'artemisConfiguration',
            displayName: 'Artemis Configuration',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'Artemis configuration files',
            value: [
                '/data/artemis/cfrmbroker/etc/artemis.profile',
                '/data/artemis/cfrmbroker/etc/broker.xml',
                '/data/artemis/cfrmbroker/etc/logging.properties'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]

        },
        {
            name: 'artemisLogs',
            displayName: 'Artemis Logs',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'Artemis log files',
            value: [
                '/data/artemis/cfrmbroker/log'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]

        }
    ]
};
