import { ACTION_JOB_CONFIG_TYPES, ACTION_JOB_CONFIG_ROLES } from '../config.js';

export const QUERY_EXPORTER_ACTION_JOBS_TEMPLATE = {
    name: 'queryExporter',
    displayName: 'Query Exporter',
    bt_role: ['oradb'],
    description: 'Query Exporter actions',
    actions: [
        {
            name: 'queryExporterRestart',
            displayName: 'Query Exporter Restart',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Restart Query-Exporter service',
            value: ['sudo systemctl restart sqlexporter.service'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'queryExporterStart',
            displayName: 'Query Exporter Start',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Start Query-Exporter service',
            value: ['sudo systemctl start sqlexporter.service'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'queryExporterStop',
            displayName: 'Query Exporter Stop',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Stop Query-Exporter service',
            value: ['sudo systemctl stop sqlexporter.service'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED]
        },
        {
            name: 'queryExporterStatus',
            displayName: 'Query Exporter Status',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Query-Exporter Service status',
            value: ['sudo systemctl status sqlexporter.service'],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        },
        {
            name: 'queryExporterConfiguration',
            displayName: 'Query Exporter Configuration',
            type: ACTION_JOB_CONFIG_TYPES.FILE_VIEW,
            isActive: true,
            description: 'Query-Exporter configuration files',
            value: [
                '/data/sqlexporter_config'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        },
        {
            name: 'queryExporterLogs',
            displayName: 'Query Exporter Logs',
            type: ACTION_JOB_CONFIG_TYPES.SSH_COMMAND,
            isActive: true,
            description: 'Query-Exporter log files',
            value: [
                'sudo journalctl -u sqlexporter.service --no-pager'
            ],
            roles: [ACTION_JOB_CONFIG_ROLES.ADMIN, ACTION_JOB_CONFIG_ROLES.ADVANCED, ACTION_JOB_CONFIG_ROLES.BASIC]
        }
    ]
};
