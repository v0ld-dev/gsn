// SPDX-License-Identifier:MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20("Test Token", "TOK") {

    function mint(address rec, uint amount) public {
        _mint(rec, amount);
        //_approve(rec, spender[0], amount);
        //_approve(rec, spender[1], amount);
    }
}
