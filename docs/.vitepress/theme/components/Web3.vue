<script setup>
import { useData } from 'vitepress'
import { useWeb3Auth } from '../composables/useWeb3Auth'
import DialogWide from './DialogWide.vue'
import { NFTStorage, Blob } from 'nft.storage'

const { frontmatter } = $(useData())
const { doConnect, connectedChain, initContract, walletAddress, parseEther, getContractInfo } = $(useWeb3Auth())

let msg = $ref('')
let showCreateTokenDialog = $ref(false)
let isLoading = $ref(false)
let title = $ref(frontmatter.title || '')
let description = $ref(frontmatter.description || '')
let basicPrice = $ref(frontmatter.basicPrice || '')
let inviteCommission = $ref(frontmatter.inviteCommission || '')
const contentCID = $computed(() => frontmatter.contentCID)
const imageCID = $computed(() => frontmatter.imageCID)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDIxMmZkRTRBOEFhY0RCZWE3RWFkRGNFMGU1NkI0NTFDQzdlNTM2QjYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2ODk1MTU2MTkwNiwibmFtZSI6IldlYjNWaXRlUHJlc3MifQ.yxdHbHZAjmjYgo2WL5G0vmRH5OdOEhvh9dWys2EVGzk'
// const client = new NFTStorage({ token: import.meta.env.NFT_STORAGE_TOKEN })
const client = new NFTStorage({ token })

const storeJson = async data => {
  return await client.storeBlob(new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  }))
}


let showMintNFTDialog = $ref(false)
const doMintNFT = async () => {
  showMintNFTDialog = true
  isLoading = true
  const tokenId = 1
  const mintAmount = 1
  const contractWriter = await initContract('SellX3', true)
  const data = {
    author: walletAddress,
    amount: mintAmount,
    tokenId,
  }
  try {
    const metadataCID = await storeJson(data)
    console.log(`====> metadataCID :`, metadataCID)
    const value = parseEther('' + basicPrice).mul(mintAmount)
    const tx = await contractWriter.mintNFT(tokenId, mintAmount, metadataCID, { value })
    const rz = await tx.wait()
    console.log(`====> rz :`, rz)
  } catch (e) {
    console.log(`====> e :`, e)
    msg = e.data.message
  }
  msg = `mint success, check it on OpenSea: https://testnets.opensea.io/assets/mumbai/0xfea51cf21b27f07b8078b19a7cdf61dc826ed453/1`
  isLoading = false
}

</script>

<template>
  <div class="p-2 pt-6">
    <div v-if="connectedChain">
      <button type="button" class="btn-primary" @click="doMintNFT">Mint NFT</button>
    </div>
    <button type="button" class="btn-primary" @click="doConnect" v-else>Connect Wallet</button>
  </div>
  <DialogWide :show="showCreateTokenDialog" @close="showCreateTokenDialog = false">
    <div v-if="isLoading" class="p-10 text-xl text-center">
      create token now, pls wait...
    </div>
    <div v-else-if="msg" class="p-10 text-xl text-center">
      {{ msg }}
    </div>
    <div class="p-5 space-y-8 text-lg divide-y divide-gray-200" v-else>
      <div class="space-y-8 divide-y divide-gray-200">
        <div>
          <div class="grid grid-cols-1 mt-6 gap-y-6 gap-x-4 sm:grid-cols-6">
            <!-- <FileUploaderThumbnail v-model="logo" title="Category Logo" class="sm:col-span-6" /> -->
            <div class="sm:col-span-6">
              <label for="title" class="block font-medium text-gray-700"> Title </label>
              <div class="mt-1">
                <input id="title" v-model="title" type="text" name="title" autocomplete="title" class="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
            </div>
            <div class="sm:col-span-6">
              <label for="description" class="block font-medium text-gray-700"> description </label>
              <div class="mt-1">
                <textarea id="description" v-model="description" name="description" rows="2" class="block w-full p-4 bg-white border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
              </div>
            </div>
            <div class="sm:col-span-6">
              <label for="basicPrice" class="block font-medium text-gray-700"> Basic Price </label>
              <div class="mt-1">
                <input id="basicPrice" v-model="basicPrice" type="text" name="basicPrice" autocomplete="basicPrice" class="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
              <p class="mt-2 text-gray-400">This is the price for your reader to mint NFT</p>
            </div>
            <div class="sm:col-span-6">
              <label for="inviteCommission" class="block font-medium text-gray-700">Invite Commission </label>
              <div class="mt-1">
                <input id="inviteCommission" v-model="inviteCommission" type="text" name="inviteCommission" autocomplete="inviteCommission" class="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              </div>
              <p class="mt-2 text-gray-400">Anyone invite new reader for you will get the commission forever for the member's any payment</p>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-5">
        <div class="flex justify-end">
          <button class="mr-4" @click="showCreateTokenDialog = false">Cancel</button>
          <button class="btn-primary" @click="doCreateToken" :isLoading="isLoading">CreateToken</button>
        </div>
      </div>
    </div>
  </DialogWide>
  <DialogWide :show="showMintNFTDialog" @close="showMintNFTDialog = false">
    <div v-if="isLoading" class="p-10 text-xl text-center">
      mint the NFT now, pls wait...
    </div>
    <div v-else>
      {{ msg }}
    </div>
  </DialogWide>
</template>