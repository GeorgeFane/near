import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

// base_asset_amount: "1000000000"
// entry_notional_amount: "91550444282"
// last_cum_funding: "0"
// market_index: "0"

const peg_multiplier = 10 ** 8;
const perps = 'AVAX BTC ETH LINK'.split(' ');

const columns = [
  { field: 'id', headerName: 'ID' },
  {
    field: 'market_index',
    headerName: 'Perpetual Type',
    type: "string",
    flex: 2,
    valueGetter: ({ value }) => perps[value]
  },
  {
    field: 'base_asset_amount',
    headerName: 'Base Asset Amount',
    type: 'string',
    flex: 2,
    valueGetter: ({ value }) => `$${value}`
  },
  {
    field: 'entry_notional_amount',
    headerName: 'Entry Notional Amount',
    type: 'string',
    flex: 2,
    valueGetter: ({ value }) => `$${value}`
  },
  {
    field: 'last_cum_funding',
    headerName: 'Last Cumulative Funding',
    type: 'string',
    flex: 2,
    valueGetter: ({ value }) => `${value}%`
  }
];

export default function DataGridDemo({ columns, rows, getCellClassName }) {
    return (
        <Box
            sx={{
                '& .red': {
                    color: 'red',
                },
                '& .green': {
                    color: 'green',
                },
            }}
            style={{
                width: 550,
                alignSelf: 'center'
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                autoHeight
                getCellClassName={getCellClassName}
            />
        </Box>
    );
}
