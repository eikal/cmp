import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import HelpIcon from '@material-ui/icons/Help';


import Card from "./Card";


const Toolbox = () => {
    const [isOpenHelpModal, setIsOpenHelpModal] = useState('');

    const handleCloseHelpModal = () => {
        setIsOpenHelpModal(false);
    }
    const handleOpenHelpModal = (row) => {
        setIsOpenHelpModal(true)
    }

    const helpModal = <Dialog disableBackdropClick={true} fullWidth open={isOpenHelpModal} onClose={handleCloseHelpModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Toolbox</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Execute general functionalities
			</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button style={{ color: 'rgb(0, 112, 185)' }} onClick={handleCloseHelpModal} color="primary">Ok</Button>
        </DialogActions>
    </Dialog>
   

    return (

            <Grid container wrap="nowrap">
            <div>
                <div style={{ display: 'flex' }}>
                    <Tooltip title="Toolbox oprations">
                        <Typography style={{ fontWeight: 300 }} variant="h4" >Toolbox</Typography>
                    </Tooltip>
                    <Button style={{ marginTop: '4px' }} aria-controls="simple-menu" aria-haspopup="true" onClick={handleOpenHelpModal} >
                        <HelpIcon aria-controls="simple-menu"></HelpIcon>
                    </Button>
                    {helpModal}
                </div>
                <br></br>
                <br></br>
                <Grid container spacing={4} style={{ justifyContent: 'space-between' }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card tag='Jobs' title='Update CCH' description='Update CCH file in all berue' titleRoutePath="cch" isDisabled={true} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card tag='Operations' title='EncryptDecrypt' description='Encrypt/Decrypt Keys in Hiera-Yaml' titleRoutePath="encryption" isDisabled={true} />
                    </Grid>
                </Grid>
            </div>
            </Grid>
    );
};

export default Toolbox;
