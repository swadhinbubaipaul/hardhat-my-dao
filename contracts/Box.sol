// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Box is Ownable {
    uint256 private value;

    // Emitted when stored value changed
    event ValueChanged(uint256 newValue);

    // Stores a new value in contract
    function store(uint256 newValue) public onlyOwner {
        value = newValue;
        emit ValueChanged(newValue);
    }

    // Read last stored value
    function retrieve() public view returns (uint256) {
        return value;
    }
}
