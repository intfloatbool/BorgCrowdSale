pragma solidity 0.5.8;

import "@openzeppelin/contracts/payment/PaymentSplitter.sol";

contract WalletSplitter is PaymentSplitter {
    constructor(address[] memory payees, uint256[] memory shares) PaymentSplitter(payees, shares) public {
        //payees - кошельки между которыми делятся деньги
        //payees - доли каждого кошелька (например у одного 10% у другого 90%)
    }
}