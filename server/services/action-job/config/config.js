export const JOBS = {
    restartMachine: 'sudo reboot',
    puppetUpdate: 'sudo puppet agent -tv',
    puppetStatus: 'sudo cat /opt/puppetlabs/puppet/cache/state/agent_disabled.lock',
    syslog: 'sudo tail -f -n 1000 /var/log/messages',
    genericAction: 'hostname',
    fileView: 'echo'
};

export const JOBS_STATUS = {
    IN_PROGRESS: 'In Progress', // in progress
    COMPLETED: 'Completed', // completed with no errors
    COMPLETED_WITH_ERRORS: 'Completed With Errors', // completed with errors
    FAILED: 'Failed', // completed with errors
    KILLED: 'Killed' // killed
};

export const ACTION_JOB_CONFIG_TYPES = {
    SSH_COMMAND: 'sshCommand',
    FILE_VIEW: 'fileView'
};

export const ACTION_JOB_CONFIG_ROLES = {
    ADMIN: 'admin',
    ADVANCED: 'advanced',
    BASIC: 'basic'
};
