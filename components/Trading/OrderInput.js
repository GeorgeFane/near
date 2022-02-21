import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import { TextField, Avatar, Typography, Grid, Chip, InputAdornment } from '@mui/material';

import OrderButton from './OrderButton';

const peg_multiplier = 10 ** 8;
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function OrderInput({ perp, value, contract_avaperps, contract_erc20copy, state }) {
  const [amount, setAmount] = React.useState(0);

  const { free_collateral, usdc_balance, positions_value, maxLeverage, quotes } = state;
  const mark_price = quotes[perp];
  const dollar_amount = formatter.format(
      amount * mark_price
  );

  return (
    <Box sx={{ width: '100%' }}>
      <List sx={{ bgcolor: 'background.paper' }}>

        <ListItem>
          <ListItemIcon>
            <Avatar
              src={`/${perp}Logo.png`}
            />
          </ListItemIcon>

          <ListItemText primary={perp.toUpperCase()} />

          <TextField
            variant='standard'
            type='number'
            placeholder='Amount'
            value={amount}
            autoFocus
            InputProps={{
              inputProps: {
                  style: {
                      textAlign: "right",
                    },
              }
            }}
            onChange={event => {
              const value = event.target.value;
              if (value >= 0) {
                setAmount(value);
              }
              else {
                  setAmount(0);
              }
            }}
          />
        </ListItem>

        <Divider />

        <ListItem>
          <ListItemIcon>
            <Avatar
              src={`/usdcLogo.png`}
            />
          </ListItemIcon>

          <ListItemText primary='USDC' />

          <TextField
            variant='standard'
            // placeholder='$ Equiv.'
            InputProps={{
              readOnly: true,
              inputProps: {
                  style: { textAlign: "right" },
              }
            }}
            value={dollar_amount}
          />

        </ListItem>

      </List>

      <Grid container
        px={1}
      >

        <Grid item xs={6}>
          <Typography
            variant='caption'
          >
            Buying Power
          </Typography>
        </Grid>

        <Grid item xs={6} textAlign='right'>
          <Typography
            variant='caption'
          >
            = {
                formatter.format(
                    free_collateral / peg_multiplier * maxLeverage
                )
            }
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant='h6'
            color='white'
          >
            Transaction Summary
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography
            variant='caption'
          >
            Average Price
          </Typography>
        </Grid>

        <Grid item xs={6} textAlign='right'>
          <Typography
            variant='caption'
          >
            = {
                formatter.format(
                    mark_price
                )
            }
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography
            variant='caption'
          >
            Trading Fee
          </Typography>
        </Grid>

        <Grid item xs={6} textAlign='right'>
          <Typography
            variant='caption'
          >
            = $0.00
          </Typography>
        </Grid>

      </Grid>

      <Divider />

      <Grid container justifyContent='center'>
        <OrderButton
          value={value}
          amount={amount}
          dollar_amount={dollar_amount}
          perp={perp}
          contract_avaperps={contract_avaperps}
          contract_erc20copy={contract_erc20copy}
        />

      </Grid>

    </Box>
  );
}
