import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';


const DeleteActionJobCategoryModal = (props) => {

    const handleCloseActionJobCategoryModal = () => {
        props.callbackCloseDeleteActionJobCategoryModal();
    };

    const handleSaveActionJobCategoryModal = () => {
        props.callbackSaveDeleteActionJobCategoryModal();
    };

    return (
        <Dialog disableBackdropClick={true} fullWidth open={props.isOpenDeleteActionJobCategoryModal} onClose={handleCloseActionJobCategoryModal} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Delete Action Job Category</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete this Action Job Category?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseActionJobCategoryModal} color="primary">No</Button>
                    <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveActionJobCategoryModal} color="primary">Yes</Button>
                </DialogActions>
            </Dialog>
    )
}
export default DeleteActionJobCategoryModal;
