// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GovernanceToken is ERC721, Ownable, EIP712, ERC721Votes {
    using Counters for Counters.Counter;

    address[] public membershipRequests;
    mapping(address => bool) public requested;

    Counters.Counter private _tokenIdCounter;

    constructor()
        ERC721("GovernanceToken", "GT")
        EIP712("GovernanceToken", "1")
    {}

    function approveMembership(uint256 id) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        address to = membershipRequests[id];
        require(balanceOf(to) <= 1, "Already Member");
        membershipRequests[id] = membershipRequests[
            membershipRequests.length - 1
        ];
        requested[to] = false;
        membershipRequests.pop();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
    }

    function requestMembership() external returns (uint256) {
        require(requested[msg.sender] == false, "Already requested");
        require(balanceOf(msg.sender) == 0, "Already Member");
        uint256 id = membershipRequests.length;
        requested[msg.sender] = true;
        membershipRequests.push(msg.sender);
        return id;
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, tokenId, batchSize);
    }
}
