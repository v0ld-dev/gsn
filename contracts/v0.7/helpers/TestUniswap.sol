// SPDX-License-Identifier:MIT
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IUniswap.sol";
import "./TestToken.sol";

// naive, no-calculation swapper.
//- the exchange rate is fixed at construction
//- mints new tokens at will...
contract TestUniswap is IUniswap {
    address[] public token;
    uint public rateMult;
    uint public rateDiv;

    constructor(uint _rateMult, uint _rateDiv) public payable {
        rateMult = _rateMult;
        rateDiv = _rateDiv;
        require(msg.value > 0, "must specify liquidity");
        require(rateMult != 0 && rateDiv != 0, "bad mult,div");
    }

    function pu(address _erc20) external {
        token.push(_erc20);
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function tokenAddress(uint i) external override view returns (address out) {
        return  address(token[i]);
    }

    function tokenToEthSwapOutput(IERC20 _token, uint256 ethBought, uint256 maxTokens, uint256 deadline) public override returns (uint256 out) {
        (maxTokens, deadline);
        uint tokensToSell = getTokenToEthOutputPrice(ethBought);
        require(address(this).balance > ethBought, "not enough liquidity");

        _token.transferFrom(msg.sender, address(this), tokensToSell);
        msg.sender.transfer(ethBought);
        return tokensToSell;
    }

    function getTokenToEthInputPrice(uint256 tokensSold) external override view returns (uint256 out) {
        return tokensSold * rateDiv / rateMult;
    }

    function tokenToEthTransferOutput(IERC20 _token, uint256 ethBought, uint256 maxTokens, uint256 deadline, address payable recipient) external override returns (uint256 out) {
        (maxTokens, deadline, recipient);
        require(address(this).balance > ethBought, "not enough liquidity");

        uint tokensToSell = getTokenToEthOutputPrice(ethBought);

        _token.transferFrom(msg.sender, address(this), tokensToSell);
        recipient.transfer(ethBought);
        return tokensToSell;
    }

    function getTokenToEthOutputPrice(uint256 ethBought) public override view returns (uint256 out) {
        return ethBought * rateMult / rateDiv;
    }
}
