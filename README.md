# de-wordpress-fevm-lighthouse

VitePress, EthersJs, IPFS, nft.storage, FEVM, lighthouse SDK, All with web3 tech to build the platform! Also, it has an ERC1155 NFT as the data center! Put your creation on to blockchain with only one Button to Click.

## FEVM

Also, we use the FEVM Actor which while bloggers create new articles, pay a $FIL fee for it. Later the Storage Provider can activate the deal then after the store expired, SP can call the claim entry to get the bounty

* contract deploy on Hyperspace testnet: <https://hyperspace.filfox.info/en/address/t410fr7bxsmemuiypsiwfbl33c4jz4qghahqvcnk2wxy>

* creator `addArticle` with $FIL: <https://github.com/Web3HackerDAO/de-wordpress-fevm-lighthouse/blob/main/contracts/SellX3.sol#L256>

* SP can activate deal: <https://github.com/Web3HackerDAO/de-wordpress-fevm-lighthouse/blob/main/contracts/SellX3.sol#L51>

* SP can claim buntry after deal expired: <https://github.com/Web3HackerDAO/de-wordpress-fevm-lighthouse/blob/main/contracts/SellX3.sol#L74>

## sponsor technology: lighthouse

The lighthouse SDK is just really great We use it to make our token gating logic, and bloggers can use it to gate their new articles/posts, so readers can mint the blogger's NFT as payment to pay for the great content.

## ERC1155 NFT as membership/sells/courses

NFT as a membership card Every buidler owns an ERC1155 NFT that web3 citizens can mint NFT as payment.
