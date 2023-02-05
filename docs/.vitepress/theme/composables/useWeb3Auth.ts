import { init, useOnboard } from '@web3-onboard/vue'
import injectedModule from '@web3-onboard/injected-wallets'
import { ethers } from "ethers";
import { CHAIN_CONTRACT_MAP, CHAIN_CONTRACT_ABI_MAP } from '../web3/CHAIN'
import { defaultChainId as chainId } from '../const.js'

console.log('====> chainId :', chainId)
// const chainId = 31415
init({
  wallets: [injectedModule()],
  accountCenter: {
    desktop: {
      position: 'bottomRight',
      enabled: true,
      minimal: true
    },
    mobile: {
      position: 'bottomRight',
      enabled: true,
      minimal: true
    }
  },
  chains: [
    {
      id: '0x61',
      token: 'tBNB',
      label: 'BSC testnet',
      rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      blockExplorerUrl: 'https://testnet.bscscan.com/'
    },
    {
      id: '0x7a69',
      token: 'tETH',
      label: 'Hardhat',
      rpcUrl: 'http://127.0.0.1:8545/',
      blockExplorerUrl: 'http://127.0.0.1:8545/'
    },
  ]
})

export const parseEther = val => ethers.utils.parseEther(val)

export const useWeb3Auth = () => {
  const { connectWallet, connectingWallet, setChain, settingChain, connectedChain, connectedWallet, disconnectConnectedWallet } = $(useOnboard())
  const doConnect = async () => {
    if (connectingWallet) return

    await connectWallet()
    await setChain({ chainId })
  }


  const ethersProvider = $computed(() => {
    if (!connectedWallet) {
      return null
    }
    return new ethers.providers.Web3Provider(
      connectedWallet.provider,
      'any'
    )
  })

  const walletAddress = $computed(() => {
    if (!ethersProvider) return null
    return ethersProvider.provider.selectedAddress
  })

  const getContractInfo = key => {
    const contractAddress = CHAIN_CONTRACT_MAP[key][chainId]
    const contractAbi = CHAIN_CONTRACT_ABI_MAP[key]
    return { contractAddress, contractAbi, chainId }
  }

  const initContract = (key, isWrite = false) => {
    const { contractAddress, contractAbi } = getContractInfo(key)

    if (!isWrite)
      return new ethers.Contract(contractAddress, contractAbi, ethersProvider);

    const signer = ethersProvider.getSigner();
    return new ethers.Contract(contractAddress, contractAbi, signer);
  };

  const previouslyConnectedWallets = JSON.parse(
    window.localStorage.getItem('alreadyConnectedWallets')
  )

  if (previouslyConnectedWallets.length > 0) {
    connectWallet({
      autoSelect: { label: previouslyConnectedWallets[0], disableModals: true }
    })
  }

  return $$({
    parseEther,
    getContractInfo,
    connectedChain,
    connectedWallet,
    connectingWallet,
    settingChain,
    walletAddress,
    doConnect,
    disconnectConnectedWallet,
    initContract,
  })
};
