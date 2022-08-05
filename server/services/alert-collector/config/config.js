const CronJobTimers = {
    ALERT_COLLECTOR: '* * * * *'
};
export default CronJobTimers;

export const ALERT_STATUS = {
    FIRING: 'firing',
    PENDING: 'pending',
    RESOLVED: 'resolved'
};

export const CACHE_KEYS = {
    LAST_ALERTS: 'lastAlerts',
    RESOLVED_ALERTS: 'resolvedAlerts',
    FIRING_ALERTS: 'firingAlerts'
};
