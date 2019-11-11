pragma solidity ^0.5.0;

import "./WalletSplitter.sol";

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigSplittedWallet is WalletSplitter {
    constructor(address[] memory payees, uint256[] memory shares) WalletSplitter(payees, shares) public {

    }
}