import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMoralis } from 'react-moralis';
import axios from 'axios';

import PositionTable from '../components/Widgets/PositionTable';
import CreditCard from '../components/Widgets/CreditCard';
import BasicGrid from '../components/Widgets/BasicGrid';

const peg_multiplier = 10 ** 8;
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function HomePage({ contract_avaperps, contract_erc20copy }) {
    const { user } = useMoralis();
    const [state, setState] = React.useState();
    const [quotes, set_quotes] = React.useState();

    const coins = 'near btc eth'.split(' ');

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

        get_prices();

        const free_collateral = await contract_avaperps.methods.free_collateral(
            from
        ).call();

        const total_collateral = await contract_avaperps.methods.user(
            from
        ).call();
        console.log(total_collateral);
        
        const usdc_balance = await contract_erc20copy.methods.balanceOf(
            from
        ).call();
        
        const positions_value = await contract_avaperps.methods.user_position_value(
            from
        ).call();
        
        const maxLeverage = await contract_avaperps.methods.maxLeverage(
        ).call();
        
        const user_positions = await contract_avaperps.methods.user_positions(
        ).call({ from });
        console.log(user_positions);
    
        setState({
            free_collateral, usdc_balance, positions_value,
            maxLeverage, user_positions, total_collateral
        });

        console.log('homepage loaded')
    }

    React.useEffect(() => {
        get_state();
    }, []);

    if (state == null) {
        // get_state();
        return <div />;
    }

    const columns = [
        { field: 'Market' },
        { field: 'Side' },
        { field: 'Amount',
            type: 'number',
        },
        { field: 'Notional',
            headerName: 'Entry Price',
            valueFormatter: params => {
                return formatter.format(params.value)
            },
            type: 'number',
        },
        { field: 'Change',
            valueFormatter: params => {
                return formatter.format(params.value)
            },
            type: 'number',
        },        
    ];

    const positions = state.user_positions[0];
    const position_values = state.user_positions[1];
    const rows = positions.map( ({ base_asset_amount, entry_notional_amount }, id) => {
        const Market = coins[id].toUpperCase() + '-PERP';
        const Side = base_asset_amount > 0 ? 'LONG' : 'SHORT';

        const Amount = Math.abs(
            base_asset_amount / peg_multiplier
        );

        const Change = Amount * quotes[coins[id]] - entry_notional_amount / peg_multiplier;

        const Notional = entry_notional_amount / peg_multiplier;
        
        return { Market, Amount, id, Change, Side, Notional };
    } ).filter(row => row.Amount > 0);

    const getCellClassName = params => {
        if (params.field == 'Side') {
            return params.value === 'SHORT' ? 'red' : 'green';
        }
        if (params.field == 'Change') {
            return params.value < 0 ? 'red' : 'green';
        }
    }

    return (
        <Box
            display='flex'
            flexDirection='column'
            width="50%"
            backgroundImage='linear-gradient(red, yellow, green)'
        >
            <Typography
                variant='h4'
            >
                Hey ishaan.near
            </Typography>

            <Typography
                variant='h6'
                color='text.secondary'
            >
                Here's your summary
            </Typography>
            <br />

            <CreditCard
                contract_avaperps={contract_avaperps}
                contract_erc20copy={contract_erc20copy}
                state={state}
            />
            <br />

            <Typography
                variant='h5'
            >
                Positions
            </Typography>
            <br />

            <PositionTable
                columns={columns}
                rows={rows}
                getCellClassName={getCellClassName}
            />
            <br />

            <Typography
                variant='h5'
            >
                Interest
            </Typography>
            <br />

            <BasicGrid
                state={state}
            />
        </Box>
    );
}
