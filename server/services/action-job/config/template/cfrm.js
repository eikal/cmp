import { ACTION_JOB_CONFIG_TYPES, ACTION_JOB_CONFIG_ROLES } from '../config.js';

export const CFRM_ACTION_JOBS_TEMPLATE = {
    name: 'cfrm',
    displayName: 'CFRM',
    bt_role: ['app', 'cfrm', 'standalone'],
    description: 'CFRM Actions',
    actions: [
        {
            name: 'icRestart',
            displayName: 'IC Restart',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Restart CFRM IC service',
            value: ['sudo -i -u cfrm /opt/ic/_manager.sh restart'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'icStart',
            displayName: 'IC Start',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Start CFRM IC service',
            value: ['sudo -i -u cfrm /opt/ic/_manager.sh start'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'icStop',
            displayName: 'IC Stop',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Stop CFRM IC service',
            value: ['sudo -i -u cfrm /opt/ic/_manager.sh stop'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'icStatus',
            displayName: 'IC Status',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Get CFRM Service status',
            value: ['sudo -i -u cfrm /opt/ic/_manager.sh status'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        },
        {
            name: 'icConfiguration',
            displayName: 'IC Configuration',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'CFRM configuration files',
            value: [
                '/opt/ic/conf/application.properties',
                '/opt/ic/conf/log4j.properties',
                '/opt/ic/Appserver/conf/server.xml',
                '/opt/ic/Appserver/bin/setenv.sh',
                '/opt/ic/Appserver/conf/Catalina/localhost/InvestigationCenter.xml'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        },
        {
            name: 'icLogs',
            displayName: 'IC Logs',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'CFRM log files',
            value: [
                '/opt/ic/logs/InvestigationCenter.log',
                '/opt/ic/Appserver/logs/catalina.out',
                '/opt/ic/logs/archive'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        }
    ]
};
