// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "./FevmActor.sol";

enum DealState {
    Created,
    Active,
    Expired
}

struct Deal {
    address createdBy;
    bytes cidraw;
    uint size;
    uint256 storageFees;
    uint256 dealStartBlockStamp;
    uint256 dealDurationInDays;
    DealState dealState;
    uint64 client;
}

contract SellX3 is ERC1155, Ownable, Pausable, ERC1155Supply {
    using Counters for Counters.Counter;
    Counters.Counter public blogIdCounter;

    uint256 public UPSERT_BLOG_PRICE = 0.0001 ether;
    uint256 public MINT_PRICE = 0.0001 ether;
    uint256 public ADD_ARTICLE_PRICE = 0.0001 ether;
    uint256 public INVITE_COMMISSION = 1000; // 1000 / 10000 = 10%
    uint256 public PLATFORM_COMMISSION = 1000; // 1000 / 10000 = 10%
    uint256 public platformCommissionBalance = 0;
    mapping(bytes => Deal) public deals;
    mapping(address => uint256) public storagePaymentBalanceMap;

    mapping(uint256 => string) public tokenURIMap;
    mapping(address => uint256[]) public tokenOwnByMap;
    mapping(uint256 => address) public ownerMap;
    mapping(uint256 => uint256) public bloggerVaultMap;
    mapping(address => address) public inviteByMap;
    mapping(address => uint256) public inviterBalanceMap;

    mapping(address => uint256) public userTotalMintCountMap; // userAddress => userTotalAmount
    mapping(uint256 => string[]) public articleCIDArrMap; // blogId =>  itemsCID[], store all cid for every blogger's articleCIDs

    function activateDealBySP(uint64 dealId) external {
        MarketTypes.GetDealDataCommitmentReturn memory commitmentRet = MarketAPI
            .getDealDataCommitment(dealId);

        bytes memory cidRaw = commitmentRet.data;

        require(
            deals[cidRaw].dealState == DealState.Created,
            "deal not in created state"
        );
        require(
            deals[cidRaw].size == commitmentRet.size,
            "data size must match expected"
        );

        MarketTypes.GetDealClientReturn memory clientRet = MarketAPI
            .getDealClient(dealId);
        // Activate the deal
        deals[cidRaw].dealState = DealState.Active;
        deals[cidRaw].dealStartBlockStamp = block.timestamp;
        deals[cidRaw].client = clientRet.client;
    }

    function withdrawReward(bytes memory cidRaw) external {
        require(
            (deals[cidRaw].dealState == DealState.Active &&
                SafeMath.div(
                    SafeMath.sub(
                        block.timestamp,
                        deals[cidRaw].dealStartBlockStamp
                    ),
                    1 days
                ) >=
                deals[cidRaw].dealDurationInDays),
            "store not exipred yet"
        );

        bytes memory emptyParams = "";
        delete emptyParams;

        require(
            storagePaymentBalanceMap[deals[cidRaw].createdBy] >=
                deals[cidRaw].storageFees,
            "creator do not have enough balance"
        );

        storagePaymentBalanceMap[deals[cidRaw].createdBy] -= deals[cidRaw]
            .storageFees;
        HyperActor.call_actor_id(
            METHOD_SEND,
            deals[cidRaw].storageFees,
            DEFAULT_FLAG,
            Misc.NONE_CODEC,
            emptyParams,
            deals[cidRaw].client
        );
    }

    function call_actor_id(
        uint64 method,
        uint256 value,
        uint64 flags,
        uint64 codec,
        bytes memory params,
        uint64 id
    ) internal returns (bool, int256, uint64, bytes memory) {
        (bool success, bytes memory data) = address(CALL_ACTOR_ID).delegatecall(
            abi.encode(method, value, flags, codec, params, id)
        );
        (int256 exit, uint64 return_codec, bytes memory return_value) = abi
            .decode(data, (int256, uint64, bytes));
        return (success, exit, return_codec, return_value);
    }

    event UpsertBlog(
        uint indexed blogId,
        address indexed createdBy,
        string indexed name,
        string description,
        string image,
        string CID
    );

    function upsertBlog(
        string[] memory blogInfoArr // name, description, image, CID, blogId
    ) public payable whenNotPaused {
        require(msg.value >= UPSERT_BLOG_PRICE, "insufficient funds");

        address createdBy = _msgSender();
        uint blogId = blogIdCounter.current();
        if (blogInfoArr.length > 4) {
            blogId = str2uint(blogInfoArr[4]);
            require(ownerMap[blogId] == createdBy, "not owner");
        } else {
            blogIdCounter.increment();
            ownerMap[blogId] = createdBy;
        }

        tokenURIMap[blogId] = blogInfoArr[3]; // CID

        emit UpsertBlog(
            blogId,
            createdBy,
            blogInfoArr[0],
            blogInfoArr[1],
            blogInfoArr[2],
            blogInfoArr[3]
        );
    }

    function str2uint(string memory numString) public pure returns (uint) {
        uint val = 0;
        bytes memory stringBytes = bytes(numString);
        for (uint i = 0; i < stringBytes.length; i++) {
            uint exp = stringBytes.length - i;
            bytes1 ival = stringBytes[i];
            uint8 uval = uint8(ival);
            uint jval = uval - uint(0x30);

            val += (uint(jval) * (10 ** (exp - 1)));
        }
        return val;
    }

    function getBlogList(
        uint start,
        uint limit
    )
        public
        view
        returns (
            string[] memory tokenURIs,
            uint[] memory totalSupplys,
            string[][] memory articleCIDArr
        )
    {
        uint lens = uint(blogIdCounter._value - start);
        if (lens < limit) {
            limit = lens;
        }

        tokenURIs = new string[](limit);
        totalSupplys = new uint[](limit);
        articleCIDArr = new string[][](limit);

        for (uint i = 0; i < limit; i++) {
            tokenURIs[i] = tokenURIMap[start + i];
            totalSupplys[i] = totalSupply(start + i);
            articleCIDArr[i] = articleCIDArrMap[start + i];
        }
    }

    event MintNFT(
        uint indexed blogId,
        address indexed createdBy,
        string indexed articleCID,
        uint amount,
        string mintType,
        string mintMetadataCID
    );

    function mintNFT(
        uint256 blogId,
        uint256 amount,
        string memory mintType, // comment, like, whatever string user want to input
        string memory articleCID,
        string memory mintMetadataCID
    ) public payable whenNotPaused {
        require(bytes(tokenURIMap[blogId]).length > 0, "blog not create yet");
        require(msg.value >= MINT_PRICE * amount, "insufficient funds");
        address createdBy = _msgSender();

        _mint(createdBy, blogId, amount, "");
        userTotalMintCountMap[createdBy] += amount;

        uint256 inviterBalanceDelta = 0;
        address inviter = inviteByMap[createdBy];
        if (inviter != address(0)) {
            inviterBalanceDelta = (INVITE_COMMISSION * msg.value) / 10000;
            inviterBalanceMap[inviter] += inviterBalanceDelta;
        }

        uint256 platformCommissionDelta = (PLATFORM_COMMISSION * msg.value) /
            10000;
        platformCommissionBalance += platformCommissionDelta;
        bloggerVaultMap[blogId] +=
            msg.value -
            (inviterBalanceDelta + platformCommissionDelta);

        emit MintNFT(
            blogId,
            createdBy,
            articleCID,
            amount,
            mintType,
            mintMetadataCID
        );
    }

    event AddArticle(
        uint indexed blogId,
        address indexed createdBy,
        string articleCID
    );

    function addArticle(
        uint256 blogId,
        string memory articleCID
    ) public payable whenNotPaused {
        address createdBy = _msgSender();
        require(createdBy == ownerMap[blogId], "you are not the owner");
        require(msg.value >= ADD_ARTICLE_PRICE, "insufficient funds");
        articleCIDArrMap[blogId].push(articleCID);

        emit AddArticle(blogId, createdBy, articleCID);
    }

    /* solhint-disable func-visibility */
    constructor() ERC1155("") {
        _setURI("");
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function uri(
        uint256 blogId
    ) public view virtual override returns (string memory) {
        string memory tokenURI = tokenURIMap[blogId];
        return tokenURI;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
