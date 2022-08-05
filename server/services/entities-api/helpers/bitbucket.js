import { BITBUCKET_CMP_DETAILS } from '../config/config.js';
import axios from 'axios';

export const getBuildDetails = async () => {
    try {
        const prs = await axios.get(`https://${BITBUCKET_CMP_DETAILS.HOST}/rest/api/1.0/projects/${BITBUCKET_CMP_DETAILS.PROJECT_KEY}/repos/${BITBUCKET_CMP_DETAILS.REPO}/pull-requests?state=MERGED`,
            {
                headers: { Authorization: `Bearer ${process.env.REPO_APIKEY}` }
            }
        );
        if (prs?.data?.values) {
            if (process.env.LDAP_DOMAIN === 'saas-p') {
                for (const pr of prs.data.values) {
                    if (pr.fromRef.displayId === 'develop' && pr.toRef.displayId === 'master') {
                        return {
                            buildNumber: pr.id,
                            environment: pr.toRef.displayId,
                            date: new Date(pr.closedDate)
                        };
                    }
                }
            } else {
                return {
                    buildNumber: prs?.data?.values[0].id,
                    environment: prs?.data?.values[0].fromRef.displayId,
                    date: new Date(prs?.data?.values[0].closedDate)
                };
            }
        }
        return {
            buildNumber: null,
            environment: null,
            date: null
        };
    } catch (ex) {
        const err = `getBuildDetails -- Error while trying to get build details, Error: ${JSON.stringify(ex)}`;
        console.log(err);
        throw err;
    }
};
