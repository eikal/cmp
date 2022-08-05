import { ACTION_JOB_CONFIG_TYPES, ACTION_JOB_CONFIG_ROLES } from '../config.js';

export const ELK_ACTION_JOBS_TEMPLATE = {
    name: 'elk',
    displayName: 'ELK',
    bt_role: ['elk', 'elasticsearch', 'elastic', 'standalone'],
    description: 'ELK Actions',
    actions: [
        {
            name: 'elkRestart',
            displayName: 'ELK Restart',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Restart ELK service',
            value: ['sudo systemctl restart elasticsearch.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'elkStart',
            displayName: 'ELK Start',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Start ELK service',
            value: ['sudo systemctl start elasticsearch.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'elkStop',
            displayName: 'ELK Stop',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Stop ELK service',
            value: ['sudo systemctl stop elasticsearch.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'elkStatus',
            displayName: 'ELK Status',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'ELK Service status',
            value: ['sudo systemctl status elasticsearch.service -i'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]

        },
        {
            name: 'elkConfiguration',
            displayName: 'ELK Configuration',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'ELK configuration files',
            value: [
                '/etc/elasticsearch'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]

        },
        {
            name: 'elkLogs',
            displayName: 'ELK Logs',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'ELK log files',
            value: [
                '/data/elasticsearch/cfrmcluster/logs'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]

        }
    ]
};
