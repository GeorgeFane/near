import Box from '@mui/material/Box';
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { useMoralis } from 'react-moralis';
import { useRouter } from 'next/router';

import { Toolbar } from '@mui/material'
import LoginButton from '../components/Buttons/LoginButton';

import logo from '../public/VistaRedLogo.png';

export default function LandingPage() {
    const imageSize = 222;
    const { isAuthenticated } = useMoralis();
    const router = useRouter();

    if (isAuthenticated) {
        router.replace('/home');
    }

    return (
        <Box>
            <Image
                src={logo}
                alt="Landing Page Logo"
                height={imageSize}
                width={imageSize}
            />

            <Typography
                variant='h1'
            >
                Symm Protocol
            </Typography>

            <Typography
                variant='h6'
                style={{ color: 'firebrick' }}
                paragraph
            >
                Long and short NEAR, BTC, and ETH with up to 5x leverage
            </Typography>

            <Typography
                variant='body2'
                style={{ color: 'firebrick' }}
            >
                Must have MetaMask switched to Aurora Testnet
            </Typography>

            <Toolbar />

            <LoginButton />
        </Box>
    );
}
