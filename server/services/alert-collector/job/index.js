import { getAlerts, filterAlert, checkIsAlertExist, createNewAlert, updateResolveAlert, getAllAlertsFromDB, parseServerName, getAlertServerRelations } from '../helpers/helpers.js';
import { CACHE_KEYS, ALERT_STATUS } from '../config/config.js';
import { setKey } from '../../../shared/node-cache.js';
/**
 * This method called according to cronjob config time.
 * This method execute get alerts from promathues.
 */
export const startSync = async () => {
    try {
        console.log(`startSync -- Start execute alert-collector, Date:${new Date().toLocaleString()}`);
        const prometheusAlerts = await getAlerts(); // Get all alerts in prometheus
        console.log(`startSync -- Found ${prometheusAlerts.length} alerts in prometheus`);
        const filteredAlerts = [];
        for (const alert of prometheusAlerts) {
            const isAlertRelevant = await filterAlert(alert); // Filter alert means that only alert that the server existing in our DB
            if (isAlertRelevant) {
                filteredAlerts.push(isAlertRelevant);
            }
        }
        console.log(`startSync -- Found ${filteredAlerts.length} filtered alerts`);
        for (const alert of filteredAlerts) { // Saving new alerts that state is equal to firing
            const isAlertExist = await checkIsAlertExist(alert);
            if (!isAlertExist) {
                await createNewAlert(alert);
            };
        }
        const firingAlerts = await getAllAlertsFromDB(null, ALERT_STATUS.FIRING);
        const resolvedAlerts = firingAlerts.filter(firingAlert => // this method find the alerts that are not firing anymore => resolved
            filteredAlerts.every(filterAlert =>
                `${firingAlert?.annotations?.summary}-${firingAlert?.server}` !== `${filterAlert?.annotations?.summary}-${parseServerName(filterAlert?.labels?.instance)}`
            )
        );
        console.log(`startSync -- Found ${resolvedAlerts.length} alerts to be closed`);
        if (resolvedAlerts && resolvedAlerts.length > 0) {
            for (const resolvedAlert of resolvedAlerts) {
                await updateResolveAlert(resolvedAlert);
            }
        }
        console.log(`startSync -- Finish execute alert-collector ,Date:${new Date().toLocaleString()}`);
    } catch (ex) {
        const err = `startSync -- Failed to start sync,Error:${ex}`;
        console.error(err);
    }
};

/**
 * This method called according to cronjob config time.
 * This method update alerts in cache for upgrade performance of alert query.
 */
export const startCache = async () => {
    try {
        await updateCache(ALERT_STATUS.RESOLVED, CACHE_KEYS.RESOLVED_ALERTS);
        await updateCache(ALERT_STATUS.FIRING, CACHE_KEYS.FIRING_ALERTS);
        await new Promise(resolve => setTimeout(resolve, 1000 * 60)); // every 60 seconds
        startCache();
    } catch (ex) {
        const err = `startCache -- Failed to start cache sync,Error:${ex}`;
        console.error(err);
    }
};

const updateCache = async (type, chacheKey) => {
    try {
        const alerts = await getAllAlertsFromDB(null, type);
        const expendendAlerts = await getAlertServerRelations(alerts);
        setKey(chacheKey, expendendAlerts);
    } catch (ex) {
        const err = `updateCache -- Failed to update cache alert type:${type} ,Error:${ex}`;
        console.error(err);
    }
};
