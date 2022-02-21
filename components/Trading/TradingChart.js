import TradingViewWidget, { Themes } from 'react-tradingview-widget';

export default function TradingChart ({ perp }) {
    return <TradingViewWidget
        symbol={perp + 'usd'}
        theme={Themes.DARK}
        autosize
    />
}
