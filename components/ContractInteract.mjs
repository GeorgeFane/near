// import Web3 from 'web3';

// import perpsABI from '../contracts/abi_avaperps.json';
// import erc20ABI from '../contracts/abi_erc20copy.json';

// import { address_erc20copy, address_avaperps } from '../contracts/contract_addresses.json';

// const web3 = new Web3(Web3.givenProvider);

// let perpsContract = await new web3.eth.Contract(perpsABI, address_avaperps);

// let erc20Contract = await new web3.eth.Contract(erc20ABI, address_erc20copy);

// let depositCollateral = async (amount, fromAddress) => {
//   await erc20Contract.methods.approve(address_avaperps, amount).send({
//     from: fromAddress
//   });
//   await perpsContract.methods.depositCollateral(amount).send({
//     from: fromAddress
//   });
// }

// let withdrawCollateral = async (amount, fromAddress) => {
//   await perpsContract.methods.withdrawCollateral(amount).send()
// }

// let openPosition = async (index, direction, amountXbase, fromAddress) => {
//   await perpsContract.methods.open_my_position(index, direction, amountXbase)
//     .send({ from: fromAddress });
// }

// let closePosition = async (index) => {
//   await perpsContract.methods.close_my_position(index, fromAddress).send({
//     from: fromAddress
//   });
// }

// export {
//   depositCollateral,
//   withdrawCollateral,
//   perpsContract,
//   erc20Contract,
// };
