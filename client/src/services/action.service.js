import axios from 'axios';
import { getCloudspaceID } from '../helpers/auth.js';

export const executeAction = (serverArray, action, actionLabelName, params, isShowOutput) => {
    try {
        axios.post(`${process.env.REACT_APP_API_ENDPOINT}/action-job/jobs`,
            {
                cloudspaceID: getCloudspaceID(),
                serverArray: serverArray,
                job: action,
                jobLabelName: actionLabelName,
                params: params,
                isShowOutput: isShowOutput
            },
            { withCredentials: true });
    } catch (ex) {

    }
}