import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { Button, Avatar, Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

import Web3 from "web3";
import { useMoralis } from "react-moralis";

import { useRouter } from 'next/router';

const peg_multiplier = 10 ** 8;
const usdcLogo = 'https://icons-for-free.com/iconfiles/png/512/cryptocurrency+icons+++color+usdc-1324449146826221536.png';

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function FormDialog({ contract_avaperps, contract_erc20copy, state }) {
    const { user } = useMoralis();

    const [open, setOpen] = React.useState(false);
    const [amount, setAmount] = React.useState();

    const router = useRouter();

    const { usdc_balance } = state;
    
    let from;
    if (user) {
        from = user.get('ethAddress');
    }

    const disabled = !user || amount <= 0;

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    async function deposit_collateral() {
        await contract_avaperps.methods.deposit_collateral(
            amount * peg_multiplier
        ).send({ from });

        router.replace('/');
    }

    async function withdraw_collateral() {
        await contract_avaperps.methods.withdraw_collateral(
            amount * peg_multiplier
        ).send({ from });

        router.replace('/');

    }

    return (
        <Box m={1}>
            <Button
                color='primary'
                variant='contained'
                onClick={handleClickOpen}
                // style={{ backgroundColor: 'darkSlateGray' }}
                startIcon={<Avatar
                    src={usdcLogo}
                />}
                disabled={!user}
            >
                Deposit/Withdraw
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    Transfer
                    
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Transfer USDC to and from this trading platform. Subject to a 1% fee.
                    </DialogContentText>

                    <TextField
                        margin="dense"
                        label="Amount (USDC)"
                        // fullWidth
                        variant="standard"
                        type='number'
                        helperText={
                            formatter.format(
                                usdc_balance / peg_multiplier
                            ) +
                            ' available for deposit'
                        }

                        value={amount}
                        onChange={event => {
                            setAmount(event.target.value);
                        }}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={deposit_collateral}
                        disabled={disabled}
                    >
                        Deposit
                    </Button>
                    <Button
                        onClick={withdraw_collateral}
                        variant='contained'
                        color='error'
                        disabled={disabled}
                    >
                        Withdraw
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}