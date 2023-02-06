import * as u8a from "uint8arrays";
import ethers from "ethers";
import fs from 'fs-extra'
import matter from 'gray-matter'
import lighthouse from '@lighthouse-web3/sdk'
import { NFTStorage, File, Blob } from 'nft.storage'
import dotenv from 'dotenv'
dotenv.config()


const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN })

const folder = process.env.name
const chain = 'Hyperspace'
const rpcUrl = 'https://api.hyperspace.node.glif.io/rpc/v1'

const getSigner = () => {
  const privateKey = process.env.PRIVATE_KEY;
  // const provider = new ethers.providers.JsonRpcProvider();
   const provider = new ethers.providers.StaticJsonRpcProvider(rpcUrl, {
        chainId: 3141,
        name: 'Hyperspace'
   });
    
  const signer = new ethers.Wallet(privateKey, provider);
  return signer
}

const sign_auth_message = async () => {
  const signer = getSigner()
  const publicKey = await signer.getAddress()
  const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data.message;
  const signedMessage = await signer.signMessage(messageRequested);

  return {signedMessage, publicKey}
}

const doUploadEncrypted = async(text) =>{
  try{
    const apiKey = process.env.LIGHTHOUSE_API_KEY;
    const sig = await sign_auth_message();
    const rz = await lighthouse.textUploadEncrypted(
      text,
      apiKey,
      sig.publicKey,
      sig.signedMessage
    );
    return {
      cid: rz.data.Hash,
      size: rz.data.Size
    }
  }catch(err){
    console.log(`====> err :`, err, text)
  }
}

const doApplyAC = async(cid, ac) =>{
  const sig = await sign_auth_message();
  const aggregator = '([1])'
  let rz = ''
  try {
      rz = await lighthouse.accessCondition(
        sig.publicKey,
        cid,
        sig.signedMessage,
        ac,
        aggregator,
      )
    }catch (err) {
      console.log(`====> err :`, err)
      return err
  }
  // console.log(`====> ac rz :`, rz)
  return 'success'
}


const initContract = async () => {
  const contractAddress = '0xf93Ea4bF57ddC2818C6e5FA4739862189b17C382'
  const abi = fs.readJsonSync('./docs/.vitepress/theme/web3/abis/SellX3.json')
  const signer = getSigner()
  return new ethers.Contract(contractAddress, abi, signer)
}
const main = async () => {
  const contractWriter = await initContract()
  const theDir = `./locked-content/${folder}`
  const outputDir = `./docs/${folder}`
  const encryptedContentMetaFilePath = `${theDir}/encryptedContentMeta.json`
  let encryptedContentMeta = {}
  if (fs.pathExistsSync(encryptedContentMetaFilePath)) {
    encryptedContentMeta = fs.readJsonSync(encryptedContentMetaFilePath)
  }
  let nftData = await import(`${theDir}/nft.js`)
  nftData = nftData.default.default
  const {contractAddress, tokenId} = nftData
  let blogs = fs.readdirSync(theDir);
  blogs = blogs.filter(item => item.endsWith('.md'))

  for (const blog of blogs) {
    console.log(`====> start deal with ${blog}`)
    const file = matter.read(`${theDir}/${blog}`, {
      excerpt: true,
      excerpt_separator: '',
    });
    console.log(`====> 1. get excerpt and content wait for encrypte`)
    const { excerpt, content, data } = file;
    const moreContent = content.replace(excerpt, '')
    const { requiredNFTCount } = data
   
    console.log(`====> 2. start encrypted content`)
    const { cid, size } = await doUploadEncrypted(moreContent)
    const encryptedContentCid = cid

    // we just calc the cid, do not store it to IPFS, as we want to keep it secret
    const originalContentEncodeBlob = await NFTStorage.encodeBlob(new Blob([moreContent]))
    const originalContentCid = originalContentEncodeBlob.cid.toString()

    if (encryptedContentMeta[originalContentCid]) {
      const oldMeta = encryptedContentMeta[originalContentCid]
      if (oldMeta.excerpt === excerpt && oldMeta.size === size && oldMeta.requiredNFTCount === requiredNFTCount) {
        console.log(`====> nothing to change`)
        return
      }
    }
   
     const accessControlConditions = [
      {
        id: 1,
        contractAddress,
        standardContractType: 'ERC1155',
        chain,
        method: 'balanceOf',
        parameters: [
          ':userAddress',
          tokenId,
        ],
        returnValueTest: {
          comparator: '>=',
          value: requiredNFTCount + '',
        }
      }
    ]
    const rz = await doApplyAC(cid, accessControlConditions)
    console.log(`====> doApplyAC rz :`, rz)

    const jsonData = {
      originalContentCid,
      encryptedContentCid,
      excerpt,
      requiredNFTCount,
      size,
    }
    const blob = new Blob([JSON.stringify(jsonData)], {
      type: 'application/json',
    })
    console.log(`====> 3. store encrypted content on to IPFS`)
    let articleCid = await client.storeBlob(blob)
    articleCid = `ipfs://${articleCid}`
    console.log(`====> 4. addArticle :`, articleCid)
    const value = ethers.utils.parseEther('0.0001')
    // await contractWriter.addArticle(tokenId, articleCid, cidRaw, size, {value})
    const tx = await contractWriter.addArticle(tokenId, articleCid, { value })
    const rc = await tx.wait()
    jsonData.articleCid = articleCid
    jsonData.txHash = tx.hash
    encryptedContentMeta[originalContentCid] = jsonData

    file.data.tokenId = tokenId
    file.data.contractAddress = contractAddress
    file.data.basicPrice = nftData.basicPrice
    file.data.articleCid = articleCid
    // file.data.inviteCommission = nftData.inviteCommission
    file.data.encryptedContentCid = encryptedContentCid
    file.content = file.excerpt
    fs.outputFileSync(`${outputDir}/${blog}`, file.stringify())
  }

  fs.writeJsonSync(encryptedContentMetaFilePath, encryptedContentMeta, {spaces: 2});
}

main()
