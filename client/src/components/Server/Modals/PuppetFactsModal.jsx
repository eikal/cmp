import React from 'react';
import CustomFilesModal from './CustomFilesModal';
import { PUPPET_FACTS } from '../../../config/actions/default-path.js';

const PuppetFactsModal = (props) => {

    return (
        <div>
            <CustomFilesModal
                files={PUPPET_FACTS}
                serverID={props.serverID}
                hostname={props.hostname}
                modalName={'Puppet Facts'}
                isScroll={true}
                closeModal={props.closeModal}
            />
        </div>
    )
}
export default PuppetFactsModal;
