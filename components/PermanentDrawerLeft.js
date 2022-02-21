import React from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';

import axios from 'axios';

import { Avatar } from '@mui/material';

import TradeButton from './Buttons/TradeButton';
import TopBar from './SideBar/TopBar';

const drawerWidth = 240;
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function PermanentDrawerLeft() {
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

    React.useEffect(() => {
        get_prices();
    }, [])

    if (quotes == null) {
        // get_prices();
        return <div />;
    }

  const items = coins.map((perp, index) => (
    <Link href={"/trade/" + perp}>
      <ListItem
        key={perp}
        button>
        <ListItemIcon>
          <Avatar
            src={`/${perp}Logo.png`}
          />
        </ListItemIcon>

        <ListItemText primary={perp.toUpperCase()} />

        <Typography>
          {
            formatter.format(
                quotes[
                    perp
                ]
            )
          }
        </Typography>
      </ListItem>
    </Link>
  ));

  // <AppBar
  //     position="fixed"
  //     sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
  //     >
  //     <Toolbar>
  //     <Typography variant="h6" noWrap component="div">
  //     Permanent drawer
  //     </Typography>
  //     </Toolbar>
  // </AppBar>

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        // flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
        // margin: 'auto'
        bgcolor: 'drawer.background'
      }}
      variant="permanent"
      anchor="left"
    >
      <TopBar />
      <Divider />

      <Box
        p={1}
        display="flex"
        justifyContent="center"
      // alignItems="center"
      >
        <TradeButton />

      </Box>

      <List>
        {items}
      </List>
    </Drawer>
  );
}
