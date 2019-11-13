pragma solidity ^0.5.0;

import "./PaymentSplitterChanged.sol";
import "@openzeppelin/contracts/access/roles/SignerRole.sol";

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
contract MultiSigSplittedWallet is  PaymentSplitterChanged, SignerRole {

    struct Transaction {
        address payable destination;
        bool executed;
    }

    uint public transactionCount;
    uint public required; //count of requirements
    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;

    constructor(address[] memory payees, uint256[] memory shares, uint _required) PaymentSplitterChanged(payees, shares) public {
        //добавление сигнер роли всем участникам
        for (uint256 i = 0; i < payees.length; i++) {
            _addSigner(payees[i]);
        }

        required = _required;
    }

    function release(address payable account) internal {
        require(_shares[account] > 0, "PaymentSplitter: account has no shares");

        uint256 totalReceived = address(this).balance.add(_totalReleased);
        uint256 payment = totalReceived.mul(_shares[account]).div(_totalShares).sub(_released[account]);

        require(payment != 0, "PaymentSplitter: account is not due payment");

        _released[account] = _released[account].add(payment);
        _totalReleased = _totalReleased.add(payment);

        account.transfer(payment); //we will not transfer from this func
        emit PaymentReleased(account, payment);
    }

    function submitTransaction(address payable destination)
        public
        returns (uint transactionId)
    {
        transactionId = addTransaction(destination);
        confirmTransaction(transactionId);
    }

    function addTransaction(address payable destination)
        internal
        notNull(destination)
        returns (uint transactionId)
    {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: destination,
            executed: false
        });
        transactionCount += 1;
        emit Submission(transactionId);
    }

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(uint transactionId)
        public
        onlySigner()
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionId Transaction ID.
    function revokeConfirmation(uint transactionId)
        public
        onlySigner()
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        emit Revocation(msg.sender, transactionId);
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
        public
        onlySigner()
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction storage txn = transactions[transactionId];
            txn.executed = true;
            release(txn.destination);
        }
    }

    /// @dev Returns the confirmation status of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Confirmation status.
    function isConfirmed(uint transactionId)
        public
        view
        returns (bool)
    {
        uint count = 0;
        for (uint i = 0; i < _payees.length; i++) {
            if (confirmations[transactionId][_payees[i]])
                count += 1;
            if (count == required)
                return true;
        }
    }


    function getBalance() public view returns(uint256) {
        return address(this).balance;
    }

    // *** MODIFERS ***
    modifier transactionExists(uint transactionId) {
        require(transactions[transactionId].destination != address(0), "Transaction not exists!");
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner], "Transaction is already confirmed!");
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner], "Transaction is not confirmed!");
        _;
    }

    modifier notExecuted(uint transactionId) {
        require(!transactions[transactionId].executed, "Transaction is already executed!");
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0), "Address is null!");
        _;
    }

    /*
     *  Events
     */
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Revocation(address indexed sender, uint indexed transactionId);
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
}