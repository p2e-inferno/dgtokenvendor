pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// learn more: https://docs.openzeppelin.com/contracts/4.x/erc20

contract YourToken is ERC20 {
    constructor() ERC20("Gold", "GLD") {
        _mint(0x23C93C4dD75b55944a58DF4cb345D0C9C6Ab5C4B, 1000 * 10 ** 18);
        _mint(msg.sender, 1500000000000000000000000000000000 * 10 ** 18);
    }
}
