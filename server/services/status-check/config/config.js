const CronJobTimers = {
    STATUS_CHECK: '*/2 * * * *'
};
export default CronJobTimers;

export const STATUS_CHECK_STATUS = {
    RUNNING: 'Running',
    UNSTABLE: 'Unstable',
    STOPPED: 'Stopped'
};

export const PuppetStatus = {
    OK: 'OK',
    WARNING: 'Warning',
    ERROR: 'Error'
};
