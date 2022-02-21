import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { Button, Avatar, Box, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

import { useRouter } from 'next/router';

import Web3 from "web3";
import { useMoralis } from "react-moralis";
import { address_erc20copy, address_avaperps } from '../../contracts/contract_addresses.json';

const peg_multiplier = 10 ** 8;
const usdcLogo = 'https://cdn-icons-png.flaticon.com/512/590/590415.png';

export default function FormDialog({ contract_avaperps, contract_erc20copy }) {
    const { user } = useMoralis();

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [amount, setAmount] = React.useState(0);

    const router = useRouter();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    
    let from;
    if (user) {
        from = user.get('ethAddress');
    }

    async function mint() {
        setLoading(true);

        contract_erc20copy.methods.mint(
            10 ** 11
        ).send({ from });

        await contract_erc20copy.methods.approveMax(
            address_avaperps
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
                Get USDC
            </Button>

            <Dialog open={open}>
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    Use Faucet
                    
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        USDC Faucet on Avalanche Fuji Testnet. Entails two transactions: minting test USDC and enabling you to deposit it.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant='contained'
                        onClick={mint}
                    >
                        Request 1000 USDC
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}