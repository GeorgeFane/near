import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

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
