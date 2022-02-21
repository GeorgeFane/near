import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { Button, Avatar, Box, IconButton, Chip } from '@mui/material';
import { Close } from '@mui/icons-material';

import { useRouter } from 'next/router';

import Web3 from "web3";
import { useMoralis } from "react-moralis";
import { address_erc20copy, address_avaperps } from '../../contracts/contract_addresses.json';

const peg_multiplier = 10 ** 8;
const usdcLogo = 'https://toppng.com/uploads/preview/up-and-down-arrow-png-one-to-two-arrows-11569046123u8rbqlzyku.png';

export default function OrderButton({
  value, amount, dollar_amount, perp, contract_avaperps, contract_erc20copy
}) {
    const router = useRouter();
    const { user } = useMoralis();
    const direction = value === 'long' ? true : false ;
    // const color = direction === 'long' ? 'success' : 'error';
    const color = 'primary';
    const label = `
        ${value.toUpperCase()} ${dollar_amount}
        of ${perp.toUpperCase()}-PERP
    `;

    const perps = 'near btc eth'.split(' ');
    const index = perps.indexOf(perp);

  let from;
  if (user) {
    from = user.get('ethAddress');
  }

    const tradeThings = async () => {
        await contract_avaperps.methods.open_my_position(
            index, direction, amount * peg_multiplier
        ).send({ from });

        router.replace('/');
    }

  return (
    <Box m={1}>
      <Chip
        color={color}
        onClick={() => tradeThings()}
        label={label}
      />
    </Box>
  );
}

