import shell from 'shelljs';
import SOURCES from '../../../config/git-repos.js';
import SourceSync from '../models/index.model.js';
/**
 * This method called according to cronjob config time.
 * This method clone "Banking Solutions Deployment Script" Repo per branch branch.
 * @param {String} (optional) branchList - array of branch names to sync
 */
export const startSync = async (branchList) => {
    for (const source of SOURCES) {
        for (const repo of source.repositories) {
            try {
                if (!repo?.enabled) {
                    console.log(`startSync -- Repo:${repo.repoName} is disabled , no sync process executed`);
                    continue;
                }
                if (branchList.length > 0) {
                    console.log(`branchList:${branchList}`);
                    repo.branches = branchList;
                } else {
                    console.log('startSync -- branches array is required');
                    continue;
                }
                console.log(`startSync -- Start clonning/updating all branches for repo:${repo.repoName} ,Date:${new Date().toLocaleString()}`);
                const codeSourceURI = `https://${process.env.SERVICE_USERNAME}:${process.env.REPO_APIKEY}@${repo.sourceUrl}`;
                const promises = [];
                for (const branch of repo.branches) {
                    const clonePath = `${repo.cloneDestinationPath}`;
                    promises.push(handleRepo(clonePath, branch, codeSourceURI));
                }
                await Promise.allSettled(promises);
                const sourceSync = new SourceSync({ lastUpdatedDate: new Date() });
                const isSourceSyncCreated = await sourceSync.save(sourceSync);
                if (isSourceSyncCreated?._doc) {
                    console.log('startSync -- Succeeded to create new Source-sync doc');
                }
                console.log(`startSync -- Finish clonning/updating all branches for repo:${repo.repoName} ,Date:${new Date().toLocaleString()}`);
                // sync monitoring
                const monitorPath = `${repo.cloneMonitoringPath}`;
                const moinitoringSourceURI = `https://${process.env.SERVICE_USERNAME}:${process.env.REPO_APIKEY}@${repo.sourceMonitoringUrl}`;
                handleRepo(monitorPath, process.env.MONITORING_BRANCH, moinitoringSourceURI);
            } catch (ex) {
                const err = `startSync -- Failed to start sync,Error:${ex}`;
                console.error(err);
            }
        }
        console.log(`startSync -- Done handle all : ${source.repositories.length} repos for source name: ${source.sourceName}, sources-sync operation ,Date:${new Date()}`);
    }
};

/**
 * This method Clone/Update single repo by branch name
 * @param {String} path - Full path where to clone the repo
 * @param {String} branch - branch is the branch name
 * @param {codeSourceURI} branch - code source URI
 */
const handleRepo = async (path, branch, codeSourceURI) => {
    try {
        const sourceSyncVersionPathExist = shell.cd(path + '/' + branch);
        if (sourceSyncVersionPathExist.stderr) {
            console.log(`handleRepo -- Clonning branch:${branch} from ${codeSourceURI}`);
            const cloneResponse = shell.exec(`git-lfs clone --branch ${branch} ${codeSourceURI} ${path}/${branch}`);
            if (cloneResponse) {
                console.log(`Response:${cloneResponse.stdout}, Error: ${cloneResponse.stderr}`);
            }
            shell.exec(`sudo chmod 777 ${path}/${branch}/prepare_scripts_for_running.sh`);
            shell.exec(`sudo dos2unix ${path}/${branch}/prepare_scripts_for_running.sh`);
            shell.cd(path + '/' + branch);
            const prepareResponse = shell.exec('./prepare_scripts_for_running.sh');
            if (cloneResponse) {
                console.log(`prepare: Response:${prepareResponse.stdout}, Error: ${prepareResponse.stderr}`);
            }
            shell.exec(`sudo chown -R cfrmcloud:cfrm ${path}/${branch}`);
        } else {
            console.log(`handleRepo -- Updating branch:${branch} at ${codeSourceURI}`);
            shell.cd(path + '/' + branch);
            const pullResponse = shell.exec('git pull');
            if (pullResponse) {
                console.log(`Updating branch: Response:${pullResponse.toString()}`);
            }
        }
        return;
    } catch (ex) {
        const err = `handleRepo -- Failed to git clone branch:${branch} from ${codeSourceURI}, Error:${ex}`;
        console.error(err);
        throw err;
    }
};
