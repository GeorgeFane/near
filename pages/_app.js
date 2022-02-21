import React from 'react';

import Moralis from 'moralis';
import { useMoralis, MoralisProvider } from "react-moralis";
import Web3 from 'web3';

import Layout from '../components/Layout';
import LandingPage from './index';

import abi_avaperps from '../contracts/abi_avaperps.json';
import abi_erc20copy from '../contracts/abi_erc20copy.json';
import { address_erc20copy, address_avaperps } from '../contracts/contract_addresses.json';

const APP_ID = 'zWytrx6G5R9k0UdpqvrptVYFTcuLiX7XMHcue9QJ';
const SERVER_URL = 'https://l0fckgbjlk4g.usemoralis.com:2053/server';

export default function App({ Component, pageProps}) {
    const [contract_avaperps, set_contract_avaperps] = React.useState();
    const [contract_erc20copy, set_contract_erc20copy] = React.useState();
    const [net_id, set_net_id] = React.useState();
    const [perp, set_perp] = React.useState(1);
    const [page, set_page] = React.useState('faucet');

    const get_net_id = async () => {
        if (Web3.givenProvider === null) {
            return;
        }
        const web3 = new Web3(Web3.givenProvider);
        let resp;

        resp = await web3.eth.net.getId();
        set_net_id(resp);

        resp = new web3.eth.Contract(abi_avaperps, address_avaperps);
        set_contract_avaperps(resp);
        
        resp = new web3.eth.Contract(abi_erc20copy, address_erc20copy);
        set_contract_erc20copy(resp);
    }

    React.useEffect(() => {
        get_net_id();
    }, [])

    if (contract_avaperps == null) {
        get_net_id();
    }   
    return (
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
            <Layout>
                <Component {...pageProps}
                    contract_avaperps={contract_avaperps}
                    contract_erc20copy={contract_erc20copy}
                />
            </Layout>
        </MoralisProvider>
    );
}

export async function getStaticProps() {
  
}