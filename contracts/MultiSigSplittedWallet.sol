pragma solidity ^0.5.0;

import "./PaymentSplitterChanged.sol";
import "@openzeppelin/contracts/access/roles/SignerRole.sol";

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
/// params
contract MultiSigSplittedWallet is  PaymentSplitterChanged, SignerRole {

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    constructor(address[] memory payees, uint256[] memory shares) PaymentSplitterChanged(payees, shares) public { 
        //добавление сигнер роли всем участникам
        for (uint256 i = 0; i < payees.length; i++) {
            _addSigner(payees[i]);
        }
    }


    //Overridere release , теперь она не отправляет деньги напрямую, а только меняет данные внутри контракта
    function release(address payable account) internal {
        require(_shares[account] > 0, "PaymentSplitter: account has no shares");

        uint256 totalReceived = address(this).balance.add(_totalReleased);
        uint256 payment = totalReceived.mul(_shares[account]).div(_totalShares).sub(_released[account]);

        require(payment != 0, "PaymentSplitter: account is not due payment");

        _released[account] = _released[account].add(payment);
        _totalReleased = _totalReleased.add(payment);

        //account.transfer(payment); //we will not transfer from this func
        emit PaymentReleased(account, payment);
    }

    //Рассчет доли
    function getPaymentCount(address payable account) internal view returns(uint256) {
        require(_shares[account] > 0, "PaymentSplitter: account has no shares");

        uint256 totalReceived = address(this).balance.add(_totalReleased);
        uint256 payment = totalReceived.mul(_shares[account]).div(_totalShares).sub(_released[account]);
        return payment;
    }
}