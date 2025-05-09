// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

contract DGToken is ERC20, AccessControlDefaultAdminRules {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(
        address _council,
        address _dev,
        uint256 initialSupply
    )
        ERC20("DreadGang", "DG")
        AccessControlDefaultAdminRules(0, _council) // 0 delay, admin is owner
    {
        _mint(_dev, initialSupply * 10 ** 18);
        _grantRole(BURNER_ROLE, _council);
    }

    function burnToken(address from, uint256 amount) public {
        require(hasRole(BURNER_ROLE, msg.sender), "Caller is not a burner");
        _burn(from, amount);
    }
}
 