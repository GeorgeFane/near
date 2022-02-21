import { useRouter } from 'next/router';
import { useMoralis } from "react-moralis";
import { Chip, Avatar } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';

export default function LoginButton() {
    const { authenticate, isAuthenticated, user, logout } = useMoralis();
    const router = useRouter();

    const onClick = async () => {
        if (isAuthenticated) {
            logout();
            router.replace('/');
        }
        else {
            await authenticate({ signingMessage: "Hello World!" })
        }
    };
    const text = isAuthenticated ? 'Logout' : 'Login';

    // console.log(user.get('ethAddress'));

    return (
        <Chip
            label={text}
            color='primary'
            // size='medium'
            icon={<AccountBalanceWallet />}
            onClick={onClick}
        />
    );
};

