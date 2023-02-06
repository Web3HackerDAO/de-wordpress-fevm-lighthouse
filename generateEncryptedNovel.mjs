import * as u8a from "uint8arrays";
import ethers from "ethers";
import siwe from "siwe";
import fs from 'fs'
import matter from 'gray-matter'

import { NFTStorage, File, Blob } from 'nft.storage'
import dotenv from 'dotenv'
dotenv.config()

const litNodeClient = new LitJsSdk.LitNodeClient({
  alertWhenUnauthorized: false,
  debug: false,
});
const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN })

const folder = process.env.name
const chain = 'mumbai'
const chainId = '0x13881'


const signAuthMessage = async () => {
    const privKey = process.env.PRIVATE_KEY
    const privKeyBuffer = u8a.fromString(privKey, "base16");
    const wallet = new ethers.Wallet(privKeyBuffer);

    const domain = "Web3VitePress";
    const origin = "https://Web3VitePress/login";
    const statement =
    "This is a test statement.  You can put anything you want here.";

    const siweMessage = new siwe.SiweMessage({
      domain,
      address: wallet.address,
      statement,
      uri: origin,
      version: "1",
      chainId,
    });

    const messageToSign = siweMessage.prepareMessage();

    const signature = await wallet.signMessage(messageToSign);

    const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);

    const authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: messageToSign,
      address: recoveredAddress,
    };

    return authSig;
}

const doEncryptedString = async(content, accessControlConditions) => {
    // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    const authSig = await signAuthMessage();
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      content,
    )
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey, // Uint8Array
      authSig,
      chain,
    })

    return {
      encryptedString,
      accessControlConditions,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16'),
    }
}
  
const main = async () => {
  await litNodeClient.connect();
  let nftData = await import(`./nft.js`)
  nftData = nftData.default
  const {contractAddress, tokenId} = nftData
  let blogs = fs.readdirSync(`./locked-content/${folder}`);
  blogs = blogs.filter(item => item.endsWith('.md'))
  let blogsArr = await Promise.all(blogs.map(async (blog) => {
    const file = matter.read(`./locked-content/${folder}/${blog}`, {
      excerpt: true,
      excerpt_separator: '',
    });
    console.log(`====> 1. get excerpt and content wait for encrypte`)
    const { excerpt, content, data } = file;
    const moreContent = content.replace(excerpt, '')
    const { requiredNFTCount } = data

    const accessControlConditions = [
      {
        contractAddress,
        standardContractType: 'ERC1155',
        chain,
        method: 'balanceOf',
        parameters: [
          ':userAddress',
          tokenId,
        ],
        returnValueTest: {
          comparator: '>',
          value: requiredNFTCount + '',
        }
      }
    ]
    console.log(`====> 2. start encrypted content`)
    const jsonData = await doEncryptedString(moreContent, accessControlConditions)
    const blob = new Blob([JSON.stringify(jsonData)], {
      type: 'application/json',
    })
    console.log(`====> 3. store encrypted content on to IPFS`)
    let cid = await client.storeBlob(blob)
    cid = `ipfs://${cid}`
    console.log(`====> 4. get ipfs cid :`, cid)

    // const contents = removeMd(excerpt)
    //   .trim()
    //   .split(/\r\n|\n|\r/);

    // if (data.CID) {
    //   return {}
    // }

    // const name = data.title || contents[0].replace(/\s{2,}/g, '').trim()
    // const description = data.description || contents
    //             .slice(1)
    //             .join('')
    //             .replace(/\s{2,}/g, '')
    //             .trim()

              
    // const image = await client.storeBlob(new Blob([fs.readFileSync(`./docs/blog/${data.image}`)]))
    // const contentCID = await client.storeBlob(new Blob([fs.readFileSync(`./docs/blog/${blog}`)]))
    // const metadata = {
    //   name,
    //   description,
    //   image,
    //   properties: {
    //     contentCID,
    //   }
    // }

    // const metadataCID = await client.storeBlob(new Blob([JSON.stringify(metadata, null, 2)], {
    //   type: "application/json",
    // }))

    // return {
    //   metadataCID,
    //   metadata,
    //   name,
    //   description,
    //   image,
    // };
  }));
  // blogsArr = blogsArr.filter(item => item.metadataCID)

  // fs.writeFileSync('./data.json', JSON.stringify(blogsArr), 'utf-8');
}

main()
