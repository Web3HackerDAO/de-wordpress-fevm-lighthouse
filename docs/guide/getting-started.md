# How to create your own Web3 WordPress Site?

The article will guide you to create your own Web3 WordPress site with token gating feature that power by the cool `lighthouse` SDK.

Every blog post/page of your site can be setup a `pay` price that only user mint enough NFT can see the encrypted content(which encrypted by lighthouse sdk), otherwise, only see the excerpt of the current page.

## Step. 1: Connect Wallet

<ClientOnly>
<BtnConnectWallet />
</ClientOnly>

## Step. 2: Create your new NFT as your creation

You can treat the NFT as your new book/course/shop/website/blog site. Whatever you want!
<ClientOnly>
<BtnNewNovel />
</ClientOnly>

## Step. 3: Write your super greate content/item in locked-content folder

## Step. 4: Encrypted your whole content via `lighthouse` sdk and store on IPFS

```sh
node generateEncryptedNovel.js
```

This command will encrypt your content with `lighthouse` and store them on to IPFS.

All metadata will auto generate and put them into the docs/$yourNovelFolder.

No-worry!

As it only include the expert part!

The docs folder will be publish after your site deployed.

## Step. 5: Deploy your site and with token gating feature

## Step. 6: Your reader can mint the NFT to support you that can decrypt your content

As this just use text content as demo, later we will build more themes(like wordpress) that the creator can pick different theme as different usecase.

It can be:

* A De-shopping site
* A course site sell source on FEVM
* A novel site sell novel on FEVM
* A photot site sell greate pictures on FEVM
