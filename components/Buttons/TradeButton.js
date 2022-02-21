import React from "react";
import { useMoralis } from "react-moralis";
import { Chip, Avatar } from '@mui/material';
import { CandlestickChart } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from "next/router";

const moralisIcon = 'https://moralis.io/wp-content/uploads/2021/06/cropped-Moralis-Favicon-Glass.png';
const metamaskIcon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png';

export default function TradeButton({ toggle_page }) {
  const router = useRouter();


  const href = router.pathname === '/home' ? '/trade/near' : '/home';

  return (
    <Link href={href}>
      <Chip
        label='Trade Perps'
        color='primary'
        icon={<CandlestickChart />}
      />
    </Link>
  );
};
