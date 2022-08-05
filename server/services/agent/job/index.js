import shell from 'shelljs';
import Agent from '../models/index.model.js';
import { getPM2List, restartPM2List } from '../integrations/pm2.js';

/**
 * This method called according to cronjob config time.
 * This method sync source code of CMP Solution and restart relevant services.
 */
export const startSync = async () => {
    try {
        console.log('------git pull-------');
        const gitPullResponse = shell.exec('git pull');
        if (gitPullResponse.toString().includes('Already up') || gitPullResponse.toString() === '') {
            console.log('Agent not found any new changes');
            return;
        }
        if (gitPullResponse.toString().includes('conflict') || gitPullResponse.toString().includes('stash')) {
            console.log('------git stash-------');
            shell.exec('git stash');
            console.log('------git pull-------');
            shell.exec('git pull');
        }
        if (gitPullResponse.toString().includes('server/package.json')) {
            console.log('------server npm install-------');
            shell.exec(`cd ${process.env.CMP_PATH}/server && npm install`);
        }
        if (gitPullResponse.toString().includes('client/package.json')) {
            console.log('------client npm install-------');
            shell.exec(`cd ${process.env.CMP_PATH}/client && npm install`);
        }
        const agent = new Agent({ lastUpdatedDate: new Date() });
        const isAgentCreated = await agent.save(agent);
        if (isAgentCreated?._doc) {
            console.log('Succeeded to create new agent doc in DB');
        }
        console.log('------CMP full restart-------');
        shell.exec(`cd ${process.env.CMP_PATH}/client && GENERATE_SOURCEMAP=false npm run build && systemctl restart nginx`);
        const processList = await getPM2List();
        const indexsProccess = [];
        const agentProcID = [];
        for (const proc of processList) {
            if (proc.name === 'agent-service') {
                agentProcID.push(proc.pm_id);
            } else {
                indexsProccess.push(proc.pm_id);
            }
        }
        for (const procID of indexsProccess) {
            await restartPM2List(procID);
        }
        await restartPM2List(agentProcID[0]);
    } catch (ex) {
        const err = `startSync -- Failed to start sync,Error:${ex}`;
        console.error(err);
    }
};
