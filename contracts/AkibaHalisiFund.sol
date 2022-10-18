// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AkibaHalisi.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./priceConverter.sol";

// 3. Interfaces, Libraries, Contracts

contract AkibaFunds is AkibaHalisi {
    using priceInterface for uint256;

    uint256 public constant premiumInUSD = 50 * 10**8;
    address[] private Insureds;
    mapping(address => uint256) public addressToPremiumDeposited;
    AggregatorV3Interface public s_priceFeed;

    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_Owner = msg.sender;
    }

    /*
    The functions needs:
    - abi of the price conversaton rate contract
    - address- from the chainlink data feeds ehtereum testnet (0x8A753747A1Fa494EC906cE90E9f37563A8AF630e)
    - choose a network to work with from the data.chain.link (rinkeyby)
    */

    function Deposit() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= premiumInUSD,
            "Insuffient funds. You need to spend more ETH"
        );

        // we are not passing a variable even though it is expected (uint256 ethAmount) this is because msg.value is the first variable recognised.
        addressToPremiumDeposited[msg.sender] += msg.value;
        Insureds.push(msg.sender);
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getInsureds(uint256 index) public view returns (address) {
        return Insureds[index];
    }

    // creating a loop for withdraw function such that anytime premiums are send to th account it is withdrawn and reset to the initial default number of the address.
    function Withdraw() public onlyOwner {
        for (
            uint256 insuredIndex = 0;
            insuredIndex < Insureds.length;
            insuredIndex++
        ) {
            address insured = Insureds[insuredIndex];
            addressToPremiumDeposited[insured] = 0;
        }

        //resetting the array
        Insureds = new address[](0);

        //call
        (bool callSuccessful, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccessful);
    }
}
