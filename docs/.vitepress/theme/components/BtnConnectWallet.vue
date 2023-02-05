<script setup>
import { useWeb3Auth } from '../composables/useWeb3Auth'
const { doConnect, walletAddress, connectingWallet, disconnectConnectedWallet, settingChain } = $(useWeb3Auth())
</script>

<template>
  <div class="p-2 pt-6">
    <div v-if="walletAddress">
      {{ walletAddress }}
      <button type="button" class="btn-primary" @click="disconnectConnectedWallet">Disconnect</button>
    </div>
    <div v-else>
      <span v-if="connectingWallet">Connecting...</span>
      <span v-else-if="settingChain">Setting chain...</span>
      <button type="button" class="btn-primary" @click="doConnect" v-else>Connect Wallet</button>
    </div>
  </div>
</template>