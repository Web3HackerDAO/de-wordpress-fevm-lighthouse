<script setup>
import { useData } from 'vitepress'
import lighthouse from '@lighthouse-web3/sdk'

import Markdown from 'vue3-markdown-it';
import { useWeb3Auth } from '../composables/useWeb3Auth'
import { useNFTStorage } from '../composables/useNFTStorage'
import { notificationStore } from '../stores/notificationStore'

const { addSuccess } = $(notificationStore())
const { storeJson, getJson } = $(useNFTStorage())
const { doConnect, walletAddress, connectingWallet, disconnectConnectedWallet, settingChain, parseEther, signer } = $(useWeb3Auth())

const { frontmatter } = $(useData())
const requiredNFTCount = $computed(() => frontmatter.requiredNFTCount)
const encryptedContentCid = $computed(() => frontmatter.encryptedContentCid)
const contractAddress = $computed(() => frontmatter.contractAddress)
const tokenId = $computed(() => frontmatter.tokenId)
const articleCid = $computed(() => frontmatter.articleCid)

let isLoading = $ref(false)
let error = $ref('')
let msg = $ref('')
const chain = 'Hyperspace'

const decryptedContentMap = $ref({})
const decryptedContent = $computed(() => decryptedContentMap[articleCid])

const getSignature = async () => {
  const publicKey = await signer.getAddress()
  const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data.message
  const signedMessage = await signer.signMessage(messageRequested)
  return ({
    signedMessage,
    publicKey,
  })
}

const doDecryptString = async (cid) => {
  const sig = await getSignature()
  const keyObject = await lighthouse.fetchEncryptionKey(
    cid,
    sig.publicKey,
    sig.signedMessage,
  )
  const fileType = 'text/plain'
  const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key, fileType)
  decryptedContentMap[articleCid] = await decrypted.text()
}


let isUnlocked = $computed(() => decryptedContentMap[articleCid] || false)
let isUnlocking = $ref(false)
const doUnlock = async () => {
  if (isUnlocking) return
  isUnlocking = true

  try {
    await doDecryptString(encryptedContentCid)
  } catch (e) {
    console.log(`====> e :`, e)
    error = e.message
  }
  isUnlocking = false
}

</script>

<template>
  <div v-if="$frontmatter.encryptedContentCid">
    <Markdown :source="decryptedContent" v-if="isUnlocked" />
    <div class="bg-gray-400 rounded-md dark:bg-gray-200" v-else>
      <div v-if="isUnlocking">
        <Loading v-if="isUnlocking" class="h-60" />
      </div>
      <div class="px-4 py-12 mx-auto text-center max-w-7xl sm:px-6 lg:py-16 lg:px-8" v-else>
        <div class="mt-8">
          <div class="mb-10 text-xl text-red-500">
            {{ error }}
          </div>
          <div class="mb-10 text-xl text-black">
            require {{ requiredNFTCount }} NFT to decrypt this content via lighthouse
          </div>
          <button type="button" class="btn-primary" @click="doUnlock">unlock now!</button>
        </div>
      </div>
    </div>
  </div>
</template>
