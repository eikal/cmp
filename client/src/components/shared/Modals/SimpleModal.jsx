import React, { useState, useImperativeHandle, forwardRef} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const SimpleModal = forwardRef((props, ref) => {

    const [isOpenSimpleModal, setIsOpenSimpleModal] = useState(false);
    const [title, setTitle] = useState(false);
    const [text, setText] = useState(false);

    useImperativeHandle(ref, () => ({
        handleCloseSimpleModal() {
            setIsOpenSimpleModal(false);
        },
        handleOpenSimpleModal(title,text) {
            setTitle(title);
            setText(text);
            setIsOpenSimpleModal(true);
        }
    }));

    const handleCloseSimpleModal = () => {
        setIsOpenSimpleModal(false);
    }
    

    return (
        
        <Dialog disableBackdropClick={true} fullWidth maxWidth={props.size || 'xl'} open={isOpenSimpleModal} onClose={handleCloseSimpleModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseSimpleModal} color="primary">Close</Button>
            </DialogActions>
        </Dialog>
    );
})

export default SimpleModal;
