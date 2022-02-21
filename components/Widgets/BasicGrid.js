import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Divider, Switch, Chip } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    width: 550,
    color: theme.palette.text.secondary,
    alignSelf: 'center'
}));

const peg_multiplier = 10 ** 8;
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function BasicGrid({ state }) {

    const { total_collateral } = state;
    
    return (
        <Item>

            <Grid container spacing={2} style={{ textAlign: 'center' }}>

                <Grid item xs>
                    Deposited USDC
                </Grid>
                
                <Grid item xs>
                    Earn Interest
                </Grid>
                
                <Grid item xs>
                    APR
                </Grid>
                
                <Grid item xs>
                    Unrealized Gain
                </Grid>
                
                <Grid item xs>
                    Action
                </Grid>

            </Grid>
        
            <br />
            <Divider />
            <br />

            <Grid container spacing={2}>

                <Grid item xs>
                    {
                        formatter.format(
                            total_collateral / peg_multiplier
                        )
                    }
                </Grid>
                
                <Grid item xs>
                    <Switch
                        defaultChecked
                    />
                </Grid>
                
                <Grid item xs>
                    1.52%
                </Grid>
                
                <Grid item xs>
                    +$13.80
                </Grid>
                
                <Grid item xs>
                    <Chip
                        label='Settle'
                        color='primary'
                        onClick={console.log}
                    />
                </Grid>

            </Grid>
        
        </Item>
    );
}
