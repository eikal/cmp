import axios from 'axios';
/**
 * This method fetch all cfrm branches names.
 */
export const fetchBranchList = async () => {
    try {
        const codeSourceURI = 'https://bitbucket.bottomline.tech/rest/api/1.0/projects/cfrm_devops/repos/banking-solutions-deployment-scripts/branches';
        const config = {
            headers: {
                Authorization: `Bearer ${process.env.REPO_APIKEY}`
            }
        };

        const res = await axios.get(codeSourceURI, config);
        if (res && res?.status === 200) {
             // branches list
            if (res?.data?.values) {
                console.log(`Found ${res.data.values.length} branches at repo`);
                return res.data.values;
            }
        }
    } catch (ex) {
        const err = `fetch -- Failed to fetch branches ,Error:${ex}`;
        console.error(err);
        throw err;
    }
};
