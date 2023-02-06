<script setup>
import { watchEffect } from 'vue'
import { useWeb3Auth } from '../composables/useWeb3Auth'
import { useNFTStorage } from '../composables/useNFTStorage'
import { notificationStore } from '../stores/notificationStore'

const { addSuccess } = $(notificationStore())
const { storeJson } = $(useNFTStorage())
const { initContract, walletAddress, parseEther } = $(useWeb3Auth())


const defaultValMap = {
  name: '三体2：黑暗森林',
  basicPrice: '0.01',
  inviteCommission: '1',
  description: `三体人在利用科技锁死了地球人的科学之后，出动庞大的宇宙舰队直扑太阳系，意欲清除地球文明，面对地球文明前所未有的危局，人类组建起同样庞大的太空舰队，同时行星防御理事会（PDC）利用三体人思维透明的致命缺陷，制订了“面壁计划”，精选出四位“面壁者”。出乎意料地，社会学教授罗辑被选出作为四位“面壁者”之一，展开对三体人的秘密反击。虽然三体人自身无法识破人类的计谋，却依靠由地球人中的背叛者挑选出的“破壁人”与“面壁者”进行智慧博弈。
在这场你死我活的文明生存竞争中，罗辑由一开始的逃避和享乐主义，逐渐意识到自己的责任心，想到了一个对抗三体文明入侵的办法。科研军官章北海试图借一场陨石雨干涉飞船推进形式的研究方向。近二百年后，获选增援未来的他在人类舰队被“水滴”清除殆尽前，成功抢夺战舰逃离。此时罗辑证实了宇宙文明间的黑暗森林法则，任何暴露自己位置的文明都将很快被消灭。
  借助于这一发现，他以向全宇宙公布三体世界的位置坐标相威胁，暂时制止了三体对太阳系的入侵，使地球与三体建立起脆弱的战略平衡。`,
}
const image = $ref('ipfs://bafkreiffnv4mdeg665whchv6ozz6dx56fy67rv3z3tiwfrghaeaw7zlfdi')
const name = $ref(defaultValMap.name || '')
const basicPrice = $ref(defaultValMap.basicPrice || '')
const inviteCommission = $ref(defaultValMap.inviteCommission || '')
const description = $ref(defaultValMap.description || '')
const properties = $ref([
  { label: 'category', value: 'novel' },
  { label: 'author', value: 'Bruce' },
])

// state = 'addLockedContentAndCondition'
let showModal = $ref(false)
let isLoading = $ref(false)
// let error = $ref({ message: 'some error' })
let error = $ref(false)

const doCreateNewNovel = async () => {
  if (isLoading) return
  isLoading = true

  const _basicPrice = parseEther(basicPrice)
  const _inviteCommission = inviteCommission * 100
  let _properties = {}
  properties.forEach(({ label, value }) => {
    if (!label || !value) return
    _properties[label] = value
  })

  _properties = {
    ..._properties,
    basicPrice,
    inviteCommission: _inviteCommission,
  }

  const metadata = {
    name,
    description,
    image,
    properties: _properties,
  }
  const metadataCID = await storeJson(metadata)
  // const metadataCID = 'ipfs://bafkreigsvmzdgs3jgfcfps5rikzlvw7h2r3c73jq356levy6zgp75vsowm'

  let tokenId = ''
  const contractWriter = await initContract('Web3VitePress', true)
  const value = parseEther('0.01')
  try {
    const tx = await contractWriter.addBook(_basicPrice, _inviteCommission, metadataCID, { value })
    const rc = await tx.wait()
    const event = rc.events.find(event => event.event === 'AddBook')
    const rz = event.args
    tokenId = rz.tokenId.toString()
  }
  catch (err) {
    console.log(`====> err :`, err)
    isLoading = false
    error = err
    return
  }

  addSuccess('Submit success')
  await getTokenList()
  showModal = false
  setTimeout(() => {
    isLoading = false
  }, 1000)
}

let items = $ref([])

const getTokenList = async () => {
  const contractReader = await initContract('Web3VitePress')
  const rz = await contractReader.getTokenList(0, 100)
  console.log(`====> rz :`, rz)
  items = rz.tokenURIs.map((tokenURI, index) => {
    return {
      tokenId: index + '',
      tokenURI,
      totalMintCount: rz.totalMintCounts[index],
    }
  })
}

watchEffect(async () => {
  if (!walletAddress) return
  await getTokenList()
})

</script>

<template>
  <div class="p-2 pt-6">
    <div v-if="!walletAddress">
      Connect wallet first!
    </div>
    <div v-else>
      <button type="button" class="mb-4 btn-primary" @click="showModal = true">New Novel</button>
      <TokenList :items="items" />
    </div>
  </div>

  <DialogWide :show="showModal" @close="showModal = false" class="text-black">
    <div v-if="isLoading">
      <Loading v-if="isLoading" class="h-20" />
    </div>
    <div v-else-if="error">
      <Error v-model="error" />
      <div class="flex justify-center pt-4">
        <button type="button" class="ml-2 btn-primary" @click="error = false">Ok</button>
      </div>
    </div>
    <form class="p-6 space-y-4 text-gray-900 divide-y divide-gray-200 w-200" v-else>
      <div class="space-y-4 divide-y divide-gray-200 sm:space-y-2">
        <div class="space-y-4 sm:space-y-2">
          <div class="space-y-4 sm:space-y-2">
            <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label for="name" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Name</label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <div class="flex max-w-lg rounded-md shadow-sm">
                  <input type="text" name="name" id="name" autocomplete="name" v-model="name" class="flex-1 block w-full min-w-0 border-gray-400 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label for="basicPrice" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">NFT Price</label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <div class="flex max-w-lg rounded-md shadow-sm">
                  <input type="text" name="basicPrice" id="basicPrice" autocomplete="basicPrice" v-model="basicPrice" class="flex-1 block w-full min-w-0 border-gray-400 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label for="inviteCommission" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Invite Earn</label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <div class="flex max-w-lg rounded-md shadow-sm">
                  <input type="text" name="inviteCommission" id="inviteCommission" autocomplete="inviteCommission" v-model="inviteCommission" class="flex-1 block w-full min-w-0 border-gray-400 rounded-md focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>
            <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label for="description" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Description</label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <textarea id="description" name="description" v-model="description" rows="5" class="block w-full max-w-lg border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                <p class="mt-2 text-sm text-gray-500">Write a few sentences about your new novel.</p>
              </div>
            </div>

            <div class="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label for="cover-photo" class="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Cover photo</label>
              <div class="mt-1 sm:col-span-2 sm:mt-0">
                <div class="overflow-hidden rounded-lg aspect-w-2 aspect-h-3 sm:col-span-4 lg:col-span-5">
                  <FileUploaderBanner v-model="image" class="h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-5">
        <div class="flex justify-end">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Cancel</button>
          <button type="button" class="ml-2 btn-primary" @click="doCreateNewNovel" :disabled="isLoading" :class="{ 'cursor-not-allowed': isLoading }">Submit</button>
        </div>
      </div>
    </form>
  </DialogWide>
</template>
