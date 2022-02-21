import Toolbar from '@mui/material/Toolbar';
import { useMoralis } from 'react-moralis';
import Image from 'next/image';
import Typography from '@mui/material/Typography';

import LoginButton from '../Buttons/LoginButton';
import logo from '../../public/VistaRedLogo.png';

export default function TopBar() {
  const imageSize = 35;
  const { isAuthenticated } = useMoralis();


  return (
    <Toolbar>
      <Image
        src={logo}
        alt="Top Bar Logo"
        height={imageSize}
        width={imageSize}
      />
      {isAuthenticated &&
        <Typography sx={{padding: '3px'}}>ishaan.near</Typography>}
      <LoginButton />
    </Toolbar>
  );
}