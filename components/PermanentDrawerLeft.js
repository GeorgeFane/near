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
    }, []);

    if (quotes == null) {
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

class Timer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        seconds: parseInt(props.startTimeInSeconds, 10) || 0
      };
    }
  
    tick() {
      this.setState(state => ({
        seconds: state.seconds + 1
      }));
      console.log('tick')
    }
  
    componentDidMount() {
      this.interval = setInterval(() => this.tick(), 50000);
    }
  
    componentWillUnmount() {
      clearInterval(this.interval);
    }
  
    formatTime(secs) {
      let hours   = Math.floor(secs / 3600);
      let minutes = Math.floor(secs / 60) % 60;
      let seconds = secs % 60;
      return [hours, minutes, seconds]
          .map(v => ('' + v).padStart(2, '0'))
          .filter((v,i) => v !== '00' || i > 0)
          .join(':');
    }
  
    render() {
      return (
        <PermanentDrawerLeft />
      );
    }
  }
