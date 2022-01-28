// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "./Token.sol";

contract Bank {
    //assign Token contract to variable
    Token private token;

    // conversion
    uint256 public ethToKnsConversion = 100;

    //add mappings
    mapping(address => uint256) public etherBalanceOf;
    mapping(address => uint256) public depositStart;
    mapping(address => bool) public isDeposited;

    //add events
    event DepositEvent(
        address indexed user,
        uint256 etherAmount,
        uint256 timeStart,
        bool isDeposited
    );
    event WithdrawEvent(
        address indexed user,
        uint256 etherAmount,
        uint256 depositTime,
        uint256 interest
    );
    event SwapETHtoKNSEvent(
        address indexed user,
        uint256 etherAmount,
        uint256 knsAmount
    );

    //pass as constructor argument deployed Token contract
    constructor(Token _token) {
        token = _token;
    }

    function getTokenTotalSupply() public view returns (uint256) {
        uint256 totalSupply = token.totalSupply();
        return totalSupply;
    }

    function deposit() public payable {
        //check if msg.sender didn't already deposited funds
        //check if msg.value is >= than 0.01 ETH
        require(msg.value >= 1e16, "Error deposit must be >= 0.01 ETH");

        //increase msg.sender ether deposit balance
        //start msg.sender hodling time
        etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;

        // If there is no previous deposit, then save the time of this deposit only
        if (isDeposited[msg.sender] == false)
            depositStart[msg.sender] = block.timestamp;

        //set msg.sender deposit status to true
        isDeposited[msg.sender] = true;

        //emit Deposit event
        emit DepositEvent(
            msg.sender,
            msg.value,
            block.timestamp,
            isDeposited[msg.sender]
        );
    }

    function withdraw() public {
        //check if msg.sender deposit status is true
        require(
            isDeposited[msg.sender] == true,
            "Error, you must deposit first"
        );
        //assign msg.sender ether deposit balance to variable for event
        uint256 userBalance = etherBalanceOf[msg.sender];

        //check user's hodl time
        uint256 depositTime = block.timestamp - depositStart[msg.sender];

        //calc interest per second
        uint256 interestPerSecond = 31668017 *
            (etherBalanceOf[msg.sender] / 1e16);
        uint256 interest = interestPerSecond * depositTime;

        //calc accrued interest
        //send eth to user
        payable(msg.sender).transfer(userBalance);

        //send interest in tokens to user
        token.mint(msg.sender, interest);

        //reset depositer data
        depositStart[msg.sender] = 0;
        etherBalanceOf[msg.sender] = 0;
        isDeposited[msg.sender] = false;

        //emit event
        emit WithdrawEvent(msg.sender, userBalance, depositTime, interest);
    }

    function swapETHtoKNS() public payable {
        require(msg.value >= 1e18, "Error deposit must be >= 1 ETH");

        uint256 knsAmount = msg.value * ethToKnsConversion;

        token.mint(msg.sender, knsAmount);

        //emit Deposit event
        emit SwapETHtoKNSEvent(msg.sender, msg.value, knsAmount);
    }

    function borrow() public payable {
        //check if collateral is >= than 0.01 ETH
        //check if user doesn't have active loan
        //add msg.value to ether collateral
        //calc tokens amount to mint, 50% of msg.value
        //mint&send tokens to user
        //activate borrower's loan status
        //emit event
    }

    function payOff() public {
        //check if loan is active
        //transfer tokens from user back to the contract
        //calc fee
        //send user's collateral minus fee
        //reset borrower's data
        //emit event
    }
}
