import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import OrderInput from './OrderInput';

export default function OrderTabs({ perp, contract_avaperps, contract_erc20copy, state }) {
  const [value, setValue] = React.useState('long');

  const { free_collateral, usdc_balance, positions_value, maxLeverage } = state;
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example"
            variant='fullWidth'
          >
            <Tab label="Long" value="long" />
            <Tab label="Short" value="short" />
          </TabList>
        </Box>

        <OrderInput
          perp={perp}
          value={value}
          contract_avaperps={contract_avaperps}
          contract_erc20copy={contract_erc20copy}
          state={state}
        />
      </TabContext>
    </Box>
  );
}
