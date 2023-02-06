import SellX3 from './abis/SellX3.json'
export const CHAIN_MAP = {
  // '0x5': {
  //   chainId: '0x5',
  //   chainName: 'Goerli Test Network',
  //   blockExplorerUrls: ['https://goerli.etherscan.io'],
  //   nativeCurrency: { name: 'GeorliETH', symbol: 'gETH', decimals: 18 },
  //   rpcUrls: ['https://goerli.infura.io/v3/'],
  // },
  '0x61': {
    chainId: '0x61',
    chainName: 'BSC testnet',
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  },
  '0x89': {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    blockExplorerUrls: ['https://polygonscan.com/'],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/', 'https://rpc-mainnet.maticvigil.com/'],
  },
  '0x7a69': {
    chainId: '0x7a69',
    chainName: 'Hardhat',
    blockExplorerUrls: ['http://127.0.0.1:8545/'],
    nativeCurrency: { name: 'tETH', symbol: 'tETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545/'],
  },
  '0x13881': {
    chainId: '0x13881',
    chainName: 'Polygon Testnet Mumbai',
    blockExplorerUrls: [
      'https://mumbai.polygonscan.com/',
    ],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: [
      'https://matic-mumbai.chainstacklabs.com',
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-testnet-archive-rpc.bwarelabs.com',
    ],
  },
  "0xc45": {
    "blockExplorerUrls": [
      "https://hyperspace.filfox.info/en"
    ],
    "chainId": "0xc45",
    "chainName": "Hyperspace",
    "nativeCurrency": {
      "decimals": 18,
      "name": "tFIL",
      "symbol": "tFIL"
    },
    "rpcUrls": [
      "https://api.hyperspace.node.glif.io/rpc/v1",
    ]
  },
}

export const CHAIN_CONTRACT_MAP = {
  SellX3: {
    '0xc45': '0x8fC379308CA230f922C50af7b17139E40c701e15',
  },
}

export const CHAIN_CONTRACT_ABI_MAP = {
  SellX3
}
