pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";

// learn more: https://docs.openzeppelin.com/contracts/4.x/erc20

contract DGToken is ERC20, AccessControlDefaultAdminRules {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    uint256 public constant OWNER_SUPPLY = 100000000 * 10 ** 18;
    address public constant ETH_RWANDA_FAUCET_MANAGER = 0xd443188B33a13A24F63AC3A49d54DB97cf64349A; // eth Rwanda Faucet Manager address
    address public constant P2E_INFERNO_ENS = 0x374355b89D26325c4C4Cd96f99753b82fd64b2Bb; // p2einferno.eth resolved address
    address public constant ETH_RWANDA_ENS = 0xa0c03bE2Cf62f171e29e0d8766677cF4c50d58F8; // ethrwanda.eth resolved address 

    constructor(
        address owner,
        address dev,
        uint256 initialSupply
    )
        ERC20("DGToken", "DGT")
        AccessControlDefaultAdminRules(0, owner) // 0 delay, admin is owner
    {
        _mint(owner, OWNER_SUPPLY);
        _mint(dev, initialSupply * 10 ** 18);
        _grantRole(MINTER_ROLE, owner);
        _grantRole(BURNER_ROLE, owner);
        _grantRole(BURNER_ROLE, ETH_RWANDA_FAUCET_MANAGER);
        _grantRole(BURNER_ROLE, P2E_INFERNO_ENS);
        _grantRole(BURNER_ROLE, ETH_RWANDA_ENS);
    }

    function mintToken(address to, uint256 amount) public {
        require(hasRole(MINTER_ROLE, msg.sender), "Caller is not a minter");
        _mint(to, amount);
    }

    function burnToken(address from, uint256 amount) public {
        require(hasRole(BURNER_ROLE, msg.sender), "Caller is not a burner");
        _burn(from, amount);
    }
}
