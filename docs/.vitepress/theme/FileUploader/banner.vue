<script setup lang="ts">
import {
  PhotoIcon,
} from '@heroicons/vue/24/outline'
import DropZone from './components/DropZone.vue'
import { useNFTStorage } from '../composables/useNFTStorage'
interface Props {
  title?: string
  modelValue: string
}

const {
  title,
  modelValue,
} = defineProps<Props>()

let isLoading = $ref(false)
let error = $ref('')
const emit = defineEmits(['update:modelValue'])

const { checkExist, storeBlob } = useNFTStorage()

const addFilesAndStartUpload = async (files) => {
  const file = files[0]
  const url = URL.createObjectURL(file)
  emit('update:modelValue', url)

  isLoading = true
  const isExist = await checkExist(file)
  if (isExist) {
    emit('update:modelValue', isExist.cid)
    isLoading = false
    return
  }

  const cid = await storeBlob(file)
  emit('update:modelValue', cid)
  isLoading = false
}

async function onInputChange(e) {
  addFilesAndStartUpload(e.target.files)
  // reset so that selecting the same file again will still cause it to fire this change
  e.target.value = null
}

const resetStatus = () => {
  emit('update:modelValue', '')
  error = ''
  isLoading = false
}
</script>
<template>
  <div class="" v-bind="$attrs">
    <DropZone v-slot="{ dropZoneActive }" class="h-full drop-area" @files-dropped="addFilesAndStartUpload">
      <div v-if="modelValue" class="relative h-full">
        <div v-show="isLoading" class="absolute top-0 left-0 flex items-center justify-center w-full h-full p-10 bg-black opacity-80">
          <eos-icons:loading class="w-10 h-10 text-white" />
        </div>
        <div v-show="error" class="absolute top-0 left-0 flex items-center justify-center w-full h-full p-10 text-red-500 bg-black opacity-80">
          {{ error }}
        </div>
        <ant-design:close-circle-filled v-show="!isLoading" class="absolute w-8 h-8 text-gray-400 top-2 right-2 hover:cursor-pointer" @click="resetStatus" />
        <ipfs-img class="object-cover w-full h-full rounded-lg" :src="modelValue" :alt="title" />
      </div>
      <div v-else class="relative flex justify-center h-full px-6 pt-5 pb-6 overflow-hidden border-2 border-gray-300 border-dashed rounded-md">
        <div class="flex flex-col items-center justify-center py-10 space-y-1 text-center">
          <PhotoIcon class="w-12 h-12 mx-auto text-gray-400" />
          <div class="h-10">
            <div v-if="dropZoneActive" class="text-gray-600">
              Drop to upload
            </div>
            <div v-else>
              <div class="text-sm text-center text-gray-600">
                Drag and Drop
              </div>
              <p class="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>
        <label for="file-uploader" class="absolute inset-0 flex items-center justify-center w-full h-full text-sm font-medium text-white bg-black bg-opacity-75 opacity-0 hover:opacity-100 focus-within:opacity-100">
          <span>Click to upload</span>
          <span class="sr-only">image</span>
          <input id="file-uploader" type="file" name="user-photo" class="absolute inset-0 w-full h-full border-gray-300 rounded-md opacity-0 cursor-pointer" @change="onInputChange">
        </label>
      </div>
    </DropZone>
  </div>
</template>
