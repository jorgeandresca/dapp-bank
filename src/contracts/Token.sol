// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public minter;

    constructor() payable ERC20("Koins", "KNS") {
        minter = msg.sender;
    }

    event MinterChanged(address indexed from, address to);

    function passMinterRole(address bank) public returns (bool) {
        require(
            msg.sender == minter,
            "Error. Only owner can pass minter role."
        );
        minter = bank;

        emit MinterChanged(msg.sender, bank);
        return true;
    }

    function mint(address account, uint256 amount) public {
        //check if msg.sender have minter role
        require(msg.sender == minter, "Error. Only minter account can mint.");
        _mint(account, amount);
    }
}
