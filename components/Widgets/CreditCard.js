import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Typography, Toolbar } from '@mui/material';
import { useMoralis } from 'react-moralis';
import { useRouter } from 'next/router';

import DepositButton from "../Buttons/DepositButton";
import FaucetButton from "../Buttons/FaucetButton";

const Item = styled(Paper)(({ theme }) => ({
//   ...theme.typography.body2,
  padding: theme.spacing(3),
  color: 'white',
  background: 'linear-gradient(to bottom right, grey, black)',
  borderRadius: 22,
  width: 550,
  alignSelf: 'center'
}));

const peg_multiplier = 10 ** 8;
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function CreditCard({ contract_avaperps, contract_erc20copy, state }) {
  const { isAuthenticated, user } = useMoralis();
  const router = useRouter();

  const { free_collateral, usdc_balance, positions_value, maxLeverage, user_positions } = state;
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }

  }, []);

  return (
    <Item>

      <Grid container wrap='wrap' spacing={2}>

        <Grid item xs={6}>
          <Typography
            variant='h6'
          >
            ishaan.near
          </Typography>
        </Grid>

        <Grid item xs={6}>
          <Typography
            variant='h6'
            style={{
              textAlign: 'right',
            }}
          >
            Aurora
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Toolbar />
        </Grid>

        <Grid item xs={6}>
          <Typography
          >
            Account Value
          </Typography>

          <Typography
            variant='h4'
          >
            {
                formatter.format(
                    (
                        Number(free_collateral) + positions_value / maxLeverage
                    ) / peg_multiplier
                )
            }
          </Typography>
        </Grid>

        <Grid item xs={6}
          style={{
            textAlign: 'right',
          }}
        >
            <FaucetButton
              contract_erc20copy={contract_erc20copy}
            />
        </Grid>

        <Grid item xs={6}>

          <Typography
            variant='body2'
          >
            Free Collateral
          </Typography>

          <Typography
            variant='h5'
          >
            {
                formatter.format(
                    free_collateral / peg_multiplier
                )
            }
          </Typography>
        </Grid>

        <Grid item xs={6}
          style={{
            textAlign: 'right',
          }}
        >
            <DepositButton
              contract_avaperps={contract_avaperps}
              state={state}
            />
        </Grid>
      </Grid>

    </Item>
  );
}
