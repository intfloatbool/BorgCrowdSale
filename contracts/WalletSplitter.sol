pragma solidity 0.5.8;

import "@openzeppelin/contracts/payment/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/roles/SignerRole.sol";

contract WalletSplitter is PaymentSplitter, SignerRole {
    constructor(address[] memory payees, uint256[] memory shares) PaymentSplitter(payees, shares) public {
        //payees - кошельки между которыми делятся деньги
        //payees - доли каждого кошелька (например у одного 10% у другого 90%)

        //чтобы получить свою долю, один из участников кошелька должен вызывать функцию release(твой адрес)

        //добавление сигнер роли всем участникам
        for (uint256 i = 0; i < payees.length; i++) {
            _addSigner(payees[i]);
        }
    }
}