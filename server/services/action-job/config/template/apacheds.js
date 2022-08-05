import { ACTION_JOB_CONFIG_TYPES, ACTION_JOB_CONFIG_ROLES } from '../config.js';

export const APACHEDS_ACTION_JOBS_TEMPLATE = {
    name: 'apacheds',
    displayName: 'ApacheDS',
    bt_role: ['elk', 'elasticsearch', 'elastic', 'standalone'],
    description: 'ApacheDS Actions',
    actions: [
        {
            name: 'apachedsRestart',
            displayName: 'ApacheDS Restart',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Restart ApacheDS service',
            value: ['sudo systemctl restart apacheds.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'apachedsStart',
            displayName: 'ApacheDS Start',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Start ApacheDS service',
            value: ['sudo systemctl start apacheds.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'apachedsStop',
            displayName: 'ApacheDS Stop',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Stop ApacheDS service',
            value: ['sudo systemctl stop apacheds.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'apachedsStatus',
            displayName: 'ApacheDS Status',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'ApacheDS Service status',
            value: ['sudo systemctl status apacheds.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        },
        {
            name: 'apachedsLogs',
            displayName: 'ApacheDS Logs',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'ELK log files',
            value: [
                '/var/lib/apacheds*/default/log'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        }
    ]
};
