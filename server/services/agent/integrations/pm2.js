import pm2 from 'pm2';

export const connectPM2 = async () => {
    return new Promise((resolve, reject) => {
        try {
            pm2.connect((err) => {
                if (err) {
                    const error = `connectPM2 -- Failed to connect,ex:${err}`;
                    console.error(error);
                    return reject(error);
                }
                return resolve();
            });
        } catch (ex) {
            console.error(`connectPM2 -- Failed to connect,ex:${ex}`);
            return reject(ex);
        }
    });
};

export const getPM2List = async () => {
    return new Promise((resolve, reject) => {
        try {
            pm2.list((err, list) => {
                if (err) {
                    const error = `getPM2List -- Failed to get list,ex:${err}`;
                    console.error(error);
                    return reject(error);
                }
                return resolve(list);
            });
        } catch (ex) {
            console.error(`getPM2List -- Failed to get list,ex:${ex}`);
            return reject(ex);
        }
    });
};

export const restartPM2List = async (procID) => {
    return new Promise((resolve, reject) => {
        try {
            pm2.restart(procID, (err, proc) => {
                if (err) {
                    const error = `restartPM2List -- Failed to restart ${procID},ex:${err}`;
                    console.error(error);
                    return reject(error);
                };
                return resolve();
            });
        } catch (ex) {
            console.error(`restartPM2List -- Failed to restart list,ex:${ex}`);
            return reject(ex);
        }
    });
};

export const disconnectPM2 = async () => {
    pm2.disconnect();
};
