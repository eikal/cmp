import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';


const DefaultActionsModal = (props) => {

    const handleCloseDefaultActionJobModal = () => {
        props.callbackCloseDeleteDefaultActionJobModal();
    };

    const handleSaveDefaultActionJobModal = () => {
        props.callbackSaveDefaultActionJobModal();
    };

    return (
        <Dialog disableBackdropClick={true} fullWidth open={props.isOpenDefaultActionJobModal} onClose={handleCloseDefaultActionJobModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Default template Action-Jobs</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Do you want to create default action jobs for project: <strong>{props?.projectObj?.name}</strong>
                    <br></br>
                    <br></br>
                    Temaplate:
                    {['CFRM', 'ELK', 'Artemis','ApacheDS','OracleDB'].map(function (item) {
                        return <li key={item}>{item}</li>;
                    })}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseDefaultActionJobModal} color="primary">No</Button>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleSaveDefaultActionJobModal} color="primary">Yes</Button>
            </DialogActions>
        </Dialog>
    )
}
export default DefaultActionsModal;
