# How to create your own Web3 WordPress Site?

The article will guide you to create your own Web3 WordPress site with token gating feature that power by the cool `lighthouse` SDK.

Every blog post/page of your site can be setup a `pay` price that only user mint enough NFT can see the encrypted content(which encrypted by lighthouse sdk), otherwise, only see the excerpt of the current page.

## Step. 1: Connect Wallet

<BtnConnectWallet />

## Step. 2: Create your new novel

<BtnNewNovel />

## Step. 3: Write your novel chapter in locked-content folder

## Step. 4: Encrypted your whole novel chapters via web3 and store on IPFS

```sh
node generateEncryptedNovel.js
```

This command will encrypt your novel and store them on to IPFS.

All metadata will auto generate and put them into the docs/$yourNovelFolder, no-worry! As it only include the expert part!

The docs folder will be publish after the vitepress deployed.

## Step. 5: Deploy your vitepress site and with token gating feature

## Step. 6: Your reader can mint the novel's NFT to support you that can unlock your novel chapters
