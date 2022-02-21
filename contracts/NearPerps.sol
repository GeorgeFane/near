// Things TODO
// Call time from an oracle instead
// Partial liquidations

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "https://github.com/fluxprotocol/fpo-evm/blob/main/contracts/ExamplePriceFeedConsumer.sol";

contract ERC20Copy is ERC20("USD Coin", "USDC") {
    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 8;
    }

    function balanceOf() public view returns (uint256) {
        return balanceOf(msg.sender);
    }

    function approveMax(address perps) public {
        approve(perps, 2**256 - 1);
    }
}

// this means the Symm contract contains all ERC20 stuff
// in the real version, we'll do something like this:
// IERC20 USDC_CONTRACT = IERC20(USDT_CONTRACT_ADDRESS);
// and call USDC_CONTRACT.transfer(address, uint256), etc.
contract Symm {
    //
    // Data Structures
    //

    // user collateral + positions information
    mapping(address => UserInfo) public user;

    // Leverage
    uint256 public maxLeverage = 5; // max leverage users can take
    // uint public partialLiqLeverage = 10; // leverage before users are partially liquidated
    uint256 fullLiqLeverage = 10; // leverage before users are fully liquidated

    // controls special functions; starts as team --> later DAO
    address public owner;

    mapping(uint256 => Market) public Markets;
    uint256 peg_multiplier = 10**8;
    uint256 fee = 100; // in basis points

    uint256 timestamp;
    bool paused;
    uint256 insurance_fund = 0;

    // TODO: USDC stuff
    // // our contract on aurora testnet
    // // random contract on javascript vm (remix default)
    address constant USDC_CONTRACT_ADDRESS = 0xB367537885341CE0c7069Dd4798ba065c85B7dC7;
    ERC20Copy USDC_CONTRACT = ERC20Copy(USDC_CONTRACT_ADDRESS);

    //
    // Supporting Structs
    //

    struct UserInfo {
        uint256 collateral; // usdc balance
        mapping(uint256 => MarketPosition) positions;
    }

    struct MarketPosition {
        uint256 market_index;
        int256 base_asset_amount; // amount of xbase; negative when shorting
        uint256 entry_notional_amount; // entry notional amount
        int256 last_cum_funding; // unrealized funding
    }

    // all relevant information for xbase
    struct Market {
        bool initialized; // has market started?
        int256 bias; // cumulative user position (can be + or - if users are long or short)
        uint256 quote_asset_notional_amount; // xUSD value of bias
        // uint open_interest; // size of all positions (long and short)
        // uint volume; // not sure why this can't be stored off-chain
        AMM amm; // see below
        string name;
    }

    uint256 numMarkets = 0;

    string[] tokenNames = ["NEAR", "BTC", "ETH"];
    address[] oracles = [
        0x0a13BC1F3C441BCB165e8925Fe3E27d18d1Cd66C,
        0x805215466b012Eb1a5721a22Be2AD5f250beff8a,
        0x842AF8074Fa41583E3720821cF1435049cf93565
    ];

    // all relevant information for pricing
    // need to do more research on peg_multiplier
    struct AMM {
        address oracle; // Chainlink address to get price feeds from
        uint256 base_asset_amount; // amount of xbase in vAMM
        uint256 quote_asset_amount; // amount of xUSD in vAMM; same value of base_asset_amount
        int256 cum_funding_rate; // cumulative funding rate; why not off-chain?
        int256 funding_rate; // funding rate for this hour; why not off-chain?
        int256 periodicity; // how often funding rates are taken; why not off-chain?
        uint256 mark_twap; // vAMM price = (quote_asset_amount/base_asset_amount) * peg_multiplier
        int256 mark_twap_ts; // vAMM price - oracle price
    }

    //
    // Constructor and Admin Only Functions
    //

    constructor() {
        owner = msg.sender;
        timestamp = block.timestamp;
        paused = false;
    }

    function initialize_market(
        string memory name,
        address oracle,
        uint256 base_asset_amount
    ) public {
        require(msg.sender == owner, "Only admin can initialize markets");
        // require(Markets[index].initialized == false, "token has already been initialized, delete market first");
        
        Market memory m;
        m.initialized = true;
        m.name = name;
        AMM memory a = AMM(
            oracle,
            base_asset_amount * peg_multiplier,
            base_asset_amount * uint256(oracle_price(oracle)),
            0,
            0,
            3600, // 1 hour in seconds
            0,
            0
        );
        m.amm = a;

        // push market
        Markets[numMarkets] = m;
        numMarkets++;

        // update funding rates for all markets
        update_market_funding_rates();
    }

    function delete_market(uint256 index) public {
        require(msg.sender == owner, "Only admin can delete markets");
        require(Markets[index].initialized == true, "market does not exist");

        Markets[index].initialized = false;
    }

    function set_liq_leverage(
        /*uint partialLiq,*/
        uint256 fullLiq
    ) public {
        require(msg.sender == owner, "Only admin can modify leverage");
        // require(partialLev <= fullLev, "partial liquidation must be less than full liquidation");

        // partialLiqLeverage = partialLiq;
        fullLiqLeverage = fullLiq;
    }

    function set_max_leverage(uint256 lev) public {
        require(msg.sender == owner, "Only admin can modify leverage");
        maxLeverage = lev;
    }

    function pause(bool play) public {
        require(msg.sender == owner, "Only admin can pause/play contract");
        paused = play;
    }

    //
    // User Functions
    //

    function deposit_collateral(uint256 amount_usdc) public notPaused {
        // Send deposit from user to contract [escrow]
        USDC_CONTRACT.transferFrom(msg.sender, address(this), amount_usdc);

        // Calculate fee and send fee from contract [escrow] to insurance fund
        uint256 total_fee = (amount_usdc / 10**4) * fee;
        insurance_fund += total_fee;

        // Increase user's collateral by deposit - fee
        amount_usdc -= total_fee;
        user[msg.sender].collateral += amount_usdc;

        settle_funding_rates(msg.sender);
    }

    function withdraw_collateral(uint256 amount_usdc) public notPaused {
        require(
            settle_funding_rates(msg.sender),
            "error in settling funding rates"
        );
        // require(amount_usdc > 0, "must withdraw positive amount");

        // Check if user has enough free collateral to withdraw
        uint256 maxWithdrawAmount = free_collateral(msg.sender);
        require(
            amount_usdc <= maxWithdrawAmount,
            "Unable to withdraw amount requested. Please close some positions first."
        );

        // Execute

        // Decrease user's collateral by deposit
        user[msg.sender].collateral -= amount_usdc;

        // Calculate fee and send fee from contract [escrow] to insurance fund
        uint256 total_fee = ((amount_usdc / (10**4)) * fee);
        insurance_fund += total_fee;

        // Calculate withdrawal and send from contract [escrow] to user
        amount_usdc -= total_fee;
        USDC_CONTRACT.transferFrom(address(this), msg.sender, amount_usdc);
    }

    function open_my_position(
        uint256 index,
        bool direction,
        uint256 amount_xbase
    ) public {
        open_position(msg.sender, index, direction, amount_xbase);
    }

    function close_my_position(uint256 index) public {
        close_position(msg.sender, index);
    }

    function oracle_price(address oracle) public view returns (uint) {
        return uint(
            ExamplePriceFeedConsumer(oracle).getLatestPrice()
        );
    }

    function liquidate(address victim) public notPaused returns (bool) {
        require(
            settle_funding_rates(victim),
            "error in settling funding rates"
        );

        int256 position = int256(user_position_value(msg.sender));
        int256 notional = int256(user_notional_value(msg.sender));
        int256 PnL = position - notional;

        int256 currLeverage = (position /
            (int256(user[victim].collateral) + PnL));

        // Full liquidation
        if (currLeverage > int256(fullLiqLeverage)) {
            // Close positions
            for (uint256 i = 0; i < numMarkets; i++) {
                if (user[victim].positions[i].base_asset_amount != 0) {
                    close_position(victim, i);
                }
            }

            // Pay liquidator 5% fee
            uint256 liquidationReward = (user[victim].collateral * 5) / 100;
            USDC_CONTRACT.transferFrom(
                address(this),
                msg.sender,
                liquidationReward
            );

            // Pay rest to insurance fund
            user[victim].collateral -= liquidationReward;
            insurance_fund += user[victim].collateral;

            return true;
        }

        // Partial liquidation
        /*
        if (currLeverage > partialLiqLeverage)
        {
            // Calculate and tax 2.5% liquidation penalty
            uint liquidationPenalty = user[victim].collateral * 25 / 1000;
            user[victim].collateral -= liquidationPenalty;
            // Pay liquidator 50% fee of liquidation penalty
            uint liquidationReward = liquidationPenalty / 2;
            USDC_CONTRACT.transferFrom(address(this), msg.sender, liquidationReward);
            // Pay rest to insurance fund
            liquidationPenalty -= liquidationReward;
            USDC_CONTRACT.transferFrom(address(this), insurance_account, liquidationPenalty);
            // Reduce collateral by 25%
            // TODO
            for (int i = 0; i < numPositions; i++)
                remove_market_position(victim, 0);
            return true;
        }
        */

        // No liquidation
        return false;
    }

    function settle_funding_rates(address userAddy)
        public
        notPaused
        returns (bool)
    {
        emit Log(0);

        // update market funding rates, as needed
        update_market_funding_rates();

        // check how much to pay
        int256 deltaFR = 0; // amount added/subtracted from collateral
        for (uint256 i = 0; i < numMarkets; i++) {
            deltaFR += (user[userAddy].positions[i].base_asset_amount *
                (Markets[i].amm.cum_funding_rate -
                    user[userAddy].positions[i].last_cum_funding));

            user[userAddy].positions[i].last_cum_funding = Markets[i]
                .amm
                .cum_funding_rate;
        }

        // Case 0: deltaFR = 0 --> do nothing
        // Case 1: deltaFR > 0 --> insurance fund pays user
        if (deltaFR > 0) {
            // not enough USDC in insurance rund to pay funding rate
            if (uint256(deltaFR) > insurance_fund) return false;

            insurance_fund -= uint256(deltaFR);
            user[userAddy].collateral += uint256(deltaFR);
        }
        // Case 2: deltaFR < 0 --> user pays insurance fund
        else if (deltaFR < 0) {
            deltaFR *= -1;

            // Not enough money to pay funding rate, please add more collateral
            if (uint256(deltaFR) > user[userAddy].collateral) return false;

            insurance_fund += uint256(deltaFR);
            user[userAddy].collateral -= uint256(deltaFR);
        }

        return true;
    }

    function update_market_funding_rates() public notPaused returns (bool) {
        // check if one hour has passed
        uint256 Now = block.timestamp;
        if ((Now - timestamp) < (1 hours)) return false;

        int256 mark = 0;
        int256 index = 0;

        // update funding rates
        for (uint256 i = 0; i < numMarkets; i++) {
            mark = int256(
                Markets[i].amm.quote_asset_amount /
                    Markets[i].amm.base_asset_amount
            );
            index = int256(oracle_price(Markets[i].amm.oracle));

            Markets[i].amm.cum_funding_rate += ((mark - index) / (index * 24));
        }

        return true;
    }

    //
    // Private Functions
    //

    function open_position(
        address userAddy,
        uint256 index,
        bool direction,
        uint256 amount_xbase
    ) private notPaused {
        // Require market to exist
        require(Markets[index].initialized == true, "Market does not exist");
        // Check to avoid extra computation
        require(amount_xbase > 0, "Size must be greater than 0");
        require(
            settle_funding_rates(userAddy),
            "error in settling funding rates"
        );

        // Convert direction into number
        int256 dir = 1;
        if (!direction) dir = -1;

        // Calculate amount_xusd
        uint256 k = Markets[index].amm.base_asset_amount *
            Markets[index].amm.quote_asset_amount;
        uint256 base2 = uint256(
            int256(Markets[index].amm.base_asset_amount) -
                (dir * int256(amount_xbase))
        );
        uint256 quote2 = k / base2;
        uint256 amount_xusd = abs(
            int256(quote2) - int256(Markets[index].amm.quote_asset_amount)
        );

        // check if user has enough free collateral to open position
        uint256 maxOpenAmount = free_collateral(userAddy);
        // if opening trade in oposite direction, increase maxOpenAmount by 2 * userBase
        bool oppositeDirection = false;
        // user's trade is in opposite direction
        if (
            (dir * int256(user[userAddy].positions[index].base_asset_amount)) <
            0
        ) oppositeDirection = true;
        if (oppositeDirection) {
            uint256 increase = user_market_position_value(userAddy, index);
            maxOpenAmount += (2 * increase);
        }

        // maxOpenAmount = freeCollateral * maxLeverage
        maxOpenAmount *= maxLeverage;

        require(
            amount_xusd <= maxOpenAmount,
            "User is unable to open position. Not enough free collateral."
        );

        // Execute

        uint256 baa = abs(user[userAddy].positions[index].base_asset_amount);

        // Modify Market (if not trading opposite larger, because that's recursive)
        if (!oppositeDirection || baa >= amount_xbase) {
            Markets[index].amm.base_asset_amount = base2;
            Markets[index].amm.quote_asset_amount = quote2;
            Markets[index].bias += (dir * int256(amount_xbase));
            Markets[index].quote_asset_notional_amount = ((abs(
                Markets[index].bias
            ) * quote2) / base2);
        }

        // Modify User
        // 3 different scenarios for entry_notional_amount

        // Same direction - add entryNotionals
        if (!oppositeDirection) {
            // edit entry_notional
            user[userAddy]
                .positions[index]
                .entry_notional_amount += amount_xusd;

            // no change to collateral - should have enough collateral already
        }
        // Different direction, smaller magnitude --> smaller trade same direction
        else if (baa > amount_xbase) {
            uint256 not = user[userAddy].positions[index].entry_notional_amount;

            // edit collateral
            user[userAddy].collateral += amount_xusd;
            user[userAddy].collateral -= ((not * amount_xbase) / baa);

            // edit entry_notional
            user[userAddy].positions[index].entry_notional_amount *= (baa -
                amount_xbase);
            user[userAddy].positions[index].entry_notional_amount /= baa;
        }
        // Different direction, same magnitude - entryNotional = 0
        // Equivalent to closing position
        else if (baa == amount_xbase) {
            // edit collateral
            user[userAddy].collateral += amount_xusd;
            user[userAddy].collateral -= user[userAddy]
                .positions[index]
                .entry_notional_amount;

            // edit entry_notional
            user[userAddy].positions[index].entry_notional_amount = 0;
        }
        // Different direction, larger magnitude --> trade reverse direction
        // Occurs in two steps: close position, then trade in reverse direction
        else {
            // necessary for calling open_position because amount_xbase is different for second call
            amount_xbase -= baa;

            // 1. close position
            close_position(userAddy, index);

            // 2. open position in reverse direction
            open_position(userAddy, index, direction, amount_xbase);
        }

        // User::base_asset_amount
        user[userAddy].positions[index].base_asset_amount =
            user[userAddy].positions[index].base_asset_amount +
            (dir * int256(amount_xbase));
    }

    function close_position(address userAddy, uint256 index) private {
        bool direction = true;
        if (user[userAddy].positions[index].base_asset_amount > 0)
            direction = false;
        uint256 amount_xbase = abs(
            user[userAddy].positions[index].base_asset_amount
        );
        open_position(userAddy, index, direction, amount_xbase);

        /*
        // Require market to exist
        require(Markets[index].initialized == true, "Market does not exist");
        // Require user to have position in market
        int amount_xbase = 0;
        for (int i = 0; i < user[userAddy].positions[index].length; i++)
        {
            // user has existing trade in market
            if (index == user[userAddy].positions[i].market_index)
            {
                userIndex = i;
                amount_xbase = (-1 * user[userAddy].positions[i].base_asset_amount);
                break;
            }
        }
        require(userIndex != -1, "user does not have position in this market");
        // Calculate amount_xusd
        uint k = Markets[index].amm.base_asset_amount * Markets[index].amm.quote_asset_amount;
        uint base2 = Markets[index].amm.base_asset_amount - amount_xbase;
        uint quote2 = k / base2;
        int amount_xusd = Markets[index].amm.quote_asset_amount - quote2;
        // Execute
        // Modify Market
        Markets[index].amm.base_asset_amount = base2;
        Markets[index].amm.quote_asset_amount = quote2;
        Markets[index].base_asset_amount -= amount_xbase;
        Markets[index].quote_asset_notional_amount = (Markets[index].base_asset_amount * quote2/base2);
        // Modify User
        remove_market_position(userAddy, existingPositon);
        // user[userAddy].positions[existingPosition].base_asset_amount = 0;
        // user[userAddy].positions[existingPosition].entry_notional_amount = 0;
        */
    }

    // Returns user position value
    /*
        MATH
        if long, positionValue = notional + (numTokens * pricePerToken - notional)
        positionValue = numTokens * pricePerToken
        positionValue = userBase * ammQuote/ammBase
        if short, positionValue = notional + (notional - numTokens * pricePerToken)
        positionValue = notional + notional - abs(userBase * ammQuote/ammBase)
        positionValue = 2 * notional + (userBase * ammQuote/ammBase)
        in implementation,
        if short, add 2 * notional
        add userBase * ammQuote/ammBase regardless
    */
    function user_position_value(address userAddy)
        public
        view
        returns (uint256)
    {
        uint256 positionValue = 0;

        for (uint256 i = 0; i < numMarkets; i++) {
            positionValue += user_market_position_value(userAddy, i);
        }

        return positionValue;
    }

    // Calculated as value if closed position right now
    function user_market_position_value(address userAddy, uint256 index)
        public
        view
        returns (uint256)
    {
        int256 ammBase = int256(Markets[index].amm.base_asset_amount);
        int256 ammQuote = int256(Markets[index].amm.quote_asset_amount);
        int256 userBase = user[userAddy].positions[index].base_asset_amount;
        int256 newAmmQuote = ((ammBase * ammQuote) / (ammBase + userBase));

        return abs(ammQuote - newAmmQuote);

        /*uint positionValue = 0;
        int userBase = user[userAddy].positions[index].base_asset_amount;
        // if short, add 2 * notional
        if (userBase < 0)
            positionValue += (2 * user[userAddy].positions[index].entry_notional_amount);
        // add userBase * ammQuote/ammBase regardless
        int ammQuote = int(Markets[index].amm.quote_asset_amount);
        int ammBase = int(Markets[index].amm.base_asset_amount);
        positionValue = uint(int(positionValue) + userBase * ammQuote/ammBase);
        return positionValue;*/
    }

    // Returns user notional value
    function user_notional_value(address userAddy)
        public
        view
        returns (uint256)
    {
        uint256 notionalValue = 0;

        for (uint256 i = 0; i < numMarkets; i++)
            notionalValue += user[userAddy].positions[i].entry_notional_amount;

        return notionalValue;
    }

    // Returns free collateral (amount to use or withdraw)
    /* Determine whether user is able to withdraw amount_usdc
        if PnL >= 0, maxWithdrawAmount = collateral - notional/leverage
        else, maxWithdrawAmount = collateral + PnL - position/leverage
        PnL = position - notional, so figure out that first
    */
    function free_collateral(address userAddy) public view returns (uint256) {
        int256 position = int256(user_position_value(userAddy));
        int256 notional = int256(user_notional_value(userAddy));
        int256 PnL = position - notional;

        int256 freeCollateral = 0;
        if (PnL >= 0)
            freeCollateral = (int256(user[userAddy].collateral) -
                (notional / int256(maxLeverage)));
        else
            freeCollateral = (int256(user[userAddy].collateral) +
                PnL -
                (position / int256(maxLeverage)));

        uint256 safeFreeCollateral = uint256(max(freeCollateral, 0));
        return safeFreeCollateral;
    }

    function getMarketPositions(address userAddy, uint index)
        public
        view
        returns (MarketPosition memory)
    {
        require(Markets[index].initialized == true, "Market does not exist");
        
        return user[userAddy].positions[index];
    }

    function user_positions() public view returns (MarketPosition[3] memory, uint[3] memory) {
        MarketPosition[3] memory positions;
        for (uint i = 0; i < 3; i++) {
            positions[i] = user[msg.sender].positions[i];
        }

        uint[3] memory position_values;
        for (uint i = 0; i < 3; i++) {
            position_values[i] = user_market_position_value(msg.sender, i);
        }
        return (positions, position_values);
    }

    function abs(int256 x) private pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }

    function max(int256 a, int256 b) internal pure returns (int256) {
        return a >= b ? a : b;
    }

    //
    // MODIFIERS
    //
    modifier notPaused() {
        require(
            paused == false || owner == msg.sender,
            "error: protocol is paused"
        );
        _;
    }

    //
    // EVENTS
    //
    event Log(uint256 logNum);
}
