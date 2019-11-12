pragma solidity ^0.5.0;

import "@openzeppelin/contracts/payment/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/roles/SignerRole.sol";
/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigSplittedWallet is  PaymentSplitter, SignerRole{
    constructor(address[] memory payees, uint256[] memory shares) PaymentSplitter(payees, shares) public {
        
        //добавление сигнер роли всем участникам
        for (uint256 i = 0; i < payees.length; i++) {
            _addSigner(payees[i]);
        }
    }
}