pragma solidity 0.5.8;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";

contract BorgTokensCrowdsale is Crowdsale , MintedCrowdsale {
    constructor(uint256 _rate, 
                address payable _wallet, 
                ERC20 _token) MintedCrowdsale() Crowdsale(_rate, _wallet, _token) public {

    }
}