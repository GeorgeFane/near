import React from 'react';
import dynamic from 'next/dynamic';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import { useRouter } from "next/router";
import { useMoralis } from 'react-moralis';

import axios from 'axios';

import HistoryTabs from '../../components/Trading/HistoryTabs';
import OrderTabs from '../../components/Trading/OrderTabs';

const DynamicTradingChart = dynamic(
  () => import('../../components/Trading/TradingChart'),
  { ssr: false, loading: () => <Typography variant='h6'>Loading...</Typography> }
);

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
}));

export default function TradingPerpPage({ contract_avaperps, contract_erc20copy }) {
  const router = useRouter();
  const { perp } = router.query;

  const { user } = useMoralis();

  const [state, setState] = React.useState();
  const coins = 'near btc eth'.split(' ');
  const [quotes, set_quotes] = React.useState();

    const get_prices = async () => {
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=near%2Cbitcoin%2Cethereum&vs_currencies=usd'
        const resp = await axios.get(url)

        const { data } = resp;
        let obj = {}
        Object.entries(data).map( ([ key, value ]) => {
            obj[key] = value['usd'];
        })
        obj['eth'] = obj['ethereum'];
        obj['btc'] = obj['bitcoin'];

        set_quotes(obj);

    }

  const get_state = async () => {
      if (user) {
          var from = user.get('ethAddress');
      }
      else {
          return;
      }

      const free_collateral = await contract_avaperps.methods.free_collateral(
          from
      ).call();
      
      const usdc_balance = await contract_erc20copy.methods.balanceOf(
          from
      ).call();
      
      const positions_value = await contract_avaperps.methods.user_position_value(
          from
      ).call();
      
      const maxLeverage = await contract_avaperps.methods.maxLeverage(
      ).call();

      get_prices();

      if (quotes == null) {
          return;
      }
  
      setState({ free_collateral, usdc_balance, positions_value, maxLeverage, quotes });

  }

  React.useEffect(() => {
      get_state();
  }, [])

  if (state == null) {
      get_state();
      return <div />;
  }

  return (
    <Box sx={{ flexGrow: 1, width: '100%' }}>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Item
            sx={{
              height: '100%'
            }}
          >
            <DynamicTradingChart perp={perp} />
          </Item>
        </Grid>
        <Grid item xs={4}>
          <Item>
            <OrderTabs
              perp={perp}
              contract_avaperps={contract_avaperps}
              contract_erc20copy={contract_erc20copy}
              state={state}
            />
          </Item>
        </Grid>
        <Grid item xs={12}>
          <Item>
            <Box
              pl={2} pt={2}
            >
              <Typography
                variant='h6'
              >
                Trading History
              </Typography>
            </Box>

            <HistoryTabs />
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}
