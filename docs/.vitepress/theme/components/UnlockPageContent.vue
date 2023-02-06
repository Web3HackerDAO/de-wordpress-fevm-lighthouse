<script setup>
import { useData } from 'vitepress'
import LitJsSdk from '@lit-protocol/sdk-browser'

import Markdown from 'vue3-markdown-it';
import { useWeb3Auth } from '../composables/useWeb3Auth'
import { useNFTStorage } from '../composables/useNFTStorage'
import { notificationStore } from '../stores/notificationStore'
// import { litHelper } from '../helpers/litHelper'

const { addSuccess } = $(notificationStore())
const { storeJson, getJson } = $(useNFTStorage())
const { doConnect, walletAddress, connectingWallet, disconnectConnectedWallet, settingChain, parseEther } = $(useWeb3Auth())

const { frontmatter } = $(useData())
const { requiredTokenCount, contentCID } = frontmatter

let isLoading = $ref(false)
let error = $ref('')
let msg = $ref('')
const chain = 'mumbai'

const doDecryptString = async ({ encryptedSymmetricKey, encryptedString, accessControlConditions }) => {
  const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
  try {
    const symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    })

    function dataURLtoBlob(dataUrl) {
      const arr = dataUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n)
      while (n--)
        u8arr[n] = bstr.charCodeAt(n)

      return new Blob([u8arr], { type: mime })
    }

    encryptedString = dataURLtoBlob(encryptedString)

    const decryptedString = await LitJsSdk.decryptString(
      encryptedString,
      symmetricKey,
    )
    // console.log('====> decryptedString :', decryptedString)

    return { decryptedString }
  }
  catch (err) {
    console.log('====> err :', err)
    return { err }
  }
}



let isUnlocked = $ref(false)
const source = `在这场你死我活的文明生存竞争中，罗辑由一开始的逃避和享乐主义，逐渐意识到自己的责任心，想到了一个对抗三体文明入侵的办法。科研军官章北海试图借一场陨石雨干涉飞船推进形式的研究方向。近二百年后，获选增援未来的他在人类舰队被“水滴”清除殆尽前，成功抢夺战舰逃离。此时罗辑证实了宇宙文明间的黑暗森林法则，任何暴露自己位置的文明都将很快被消灭。`

let isUnlocking = $ref(false)
const doUnlock = async () => {
  if (isUnlocking) return
  isUnlocking = true
  const rz1 = await getJson(contentCID)
  try {
    const rz2 = await doDecryptString(rz1)
    console.log(`====> rz2 :`, rz1)
  } catch (e) {
    console.log(`====> e :`, e)
  }

  isUnlocked = true
}
</script>

<template>
  <div v-if="$frontmatter.contentCID">
    <Markdown :source="source" v-if="isUnlocked" />
    <div class="bg-gray-400 rounded-md dark:bg-gray-200" v-else>
      <div v-if="isUnlocking">
        <Loading v-if="isUnlocking" class="h-60" />
      </div>
      <div class="px-4 py-12 mx-auto text-center max-w-7xl sm:px-6 lg:py-16 lg:px-8" v-else>
        <div class="mt-8">
          <div class="mb-10 text-xl text-black">
            查看全文需要 {{ $frontmatter.requiredNFTCount }} 个 NFT Token.
          </div>
          <button type="button" class="btn-primary" @click="doUnlock">立即解锁</button>
        </div>
      </div>
    </div>
  </div>
</template>
