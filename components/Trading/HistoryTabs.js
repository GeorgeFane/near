import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Typography } from '@mui/material';

import PositionTable from '../Widgets/PositionTable'

export default function HistoryTabs() {
    const [value, setValue] = React.useState('All');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const labels = [
        'All', 'Orders', 'Liquidations', 'Funding Payments', 'Interest'
    ];
    const tabs = labels.map( (label, value) => (
        <Tab label={label} value={label} />
    ));
    const panels = labels.map( (label, value) => (
        <TabPanel value={label}>
            <PositionTable />
        </TabPanel>
    ));

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example"
                        variant="fullWidth"
                    >
                        {tabs}
                    </TabList>
                </Box>
            </TabContext>

            <Box
                margin='auto'
                alignItems="center"
                p={9}
                sx={{
                    width: '100%',
                    minWidth: -240,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <Typography
                    variant='h6'
                >
                    Incoming feature, stay tuned!
                </Typography>
            </Box>
        </Box>
    );
}