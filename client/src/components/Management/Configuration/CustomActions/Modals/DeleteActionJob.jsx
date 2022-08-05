import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';


const DeleteActionJobModal = (props) => {

    const handleCloseActionJobModal = () => {
        props.callbackCloseDeleteActionJobModal();
    };

    const handleSaveActionJobModal = () => {
        const deletedActionJobObj = {
            actionID: props.selectedActionJob.id || props.selectedActionJob._id,
        }
        props.callbackDeletedActionJobModal(deletedActionJobObj);
    };

    return (
        <div>
            <Dialog disableBackdropClick={true} fullWidth open={props.isOpenDeleteActionJobModal} onClose={handleCloseActionJobModal} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Delete Action-Job</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <span>Are you sure you want to delete <b>{props?.selectedActionJob?.displayName}</b> Action-Job?</span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseActionJobModal} color="primary">No</Button>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveActionJobModal} color="primary">Yes</Button>
                </DialogActions>
            </Dialog>
        </div >
    )


}
export default DeleteActionJobModal;
