<script setup lang="ts">
import { useWeb3Auth } from '../composables/useWeb3Auth'
import { ChevronRightIcon } from '@heroicons/vue/20/solid'
import { useNFTStorage } from '../composables/useNFTStorage'
import Markdown from 'vue3-markdown-it';
import 'highlight.js/styles/monokai.css';

const { getContractInfo } = $(useWeb3Auth())

const { getJson, getStatus } = $(useNFTStorage())

const emit = defineEmits(['update:modelValue'])
interface Props {
  items?: Array
}
const {
  items,
} = defineProps<Props>()


let showModal = $ref(false)
let currentItem = $ref({})
const doShowModal = item => {
  currentItem = item
  showModal = true
  console.log('====> currentItem :', currentItem)
}

let jsonItems = $ref([])
watchEffect(async () => {
  jsonItems = await Promise.all(items.map(item => getJson(item.tokenURI)))
  const status = await Promise.all(items.map(item => getStatus(item.tokenURI)))
  if (status.length > 0) {
    jsonItems = jsonItems.map((item, index) => {
      return {
        ...item,
        tokenId: index + '',
        created: status[index].created,
      }
    })
    // doShowModal(jsonItems[0])
  }
})

const mdSource = $computed(() => {
  const { contractAddress, chainId } = getContractInfo('SellX3')
  return `
\`\`\`js
exports.default = {
  contractAddress: '${contractAddress}',
  tokenId: '${currentItem.tokenId}',
  name: '${currentItem.name}',
  chainId: '${chainId}',
  basicPrice: '${currentItem.properties.basicPrice}',
  description: \`${currentItem.description}\`,
  image: '${currentItem.image}'
}
\`\`\`
`
})

</script>
<template>
  <div class="overflow-hidden bg-white shadow sm:rounded-md">
    <ul role="list" class="divide-y divide-gray-200">
      <li v-for="item in jsonItems" :key="item.tokenId">
        <div class="flex items-center px-2 py-2 sm:px-3">
          <div class="flex items-center flex-1 min-w-0">
            <div class="flex-shrink-0">
              <IpfsImg :src="item.image" class="w-20 h-20 rounded-md" />
            </div>
            <div class="flex-1 min-w-0 px-4 md:grid md:grid-cols-2 md:gap-4">
              <div>
                <p class="text-sm font-medium text-indigo-600 truncate">{{ item.name }}</p>
                <p class="flex items-center mt-2 text-sm text-gray-500">
                  <span class="truncate">{{ item.description }}</span>
                </p>
              </div>
              <div class="hidden md:block">
                <div>
                  <p class="text-sm text-gray-900">
                    <time :datetime="item.created">{{ item.created }}</time>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ChevronRightIcon class="w-5 h-5 text-gray-400 cursor-pointer" aria-hidden="true" @click="doShowModal(item)" />
          </div>
        </div>
      </li>
    </ul>
    <DialogWide :show="showModal" @close="showModal = false" class="text-black">
      <Markdown :source="mdSource" />
    </DialogWide>
  </div>
</template>