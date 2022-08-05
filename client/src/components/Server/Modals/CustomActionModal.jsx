import React, { useEffect, useState } from 'react';
import CustomFilesModal from './CustomFilesModal';

const CustomActionModal = (props) => {

    const [files, setFiles] = useState([]);

    useEffect(() => {
        buildFiles();
    }, [props.content]);

    const buildFiles = () => {
        if (props?.content?.output && props.content.jobType === 'fileView') {
            const path = props.content.output.split(',')
            setFiles(path)
        }
    }

    return (
        <div>
            <CustomFilesModal
                files={files}
                serverID={props.serverID}
                hostname={props.hostname}
                modalName={props?.content?.jobLabelName}
                isScroll={false}
                closeModal={props.closeModal}
            />
        </div>)
}
export default CustomActionModal;
