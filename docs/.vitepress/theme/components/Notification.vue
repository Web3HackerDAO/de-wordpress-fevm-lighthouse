<script setup lang="ts">
import { notificationStore } from '../stores/notificationStore'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/24/solid'
const { items, removeItem } = $(notificationStore())
</script>

<template>
  <div aria-live="assertive" class="fixed right-0 z-20 flex items-end px-4 py-6 pointer-events-none top-16 w-100 sm:p-6 sm:items-start">
    <div class="flex flex-col items-center w-full space-y-4 sm:items-end">
      <TransitionGroup name="list" tag="ul">
        <li v-for="item in items" :key="item._id">
          <div class="z-50 mb-2 overflow-hidden bg-white rounded-lg shadow-lg pointer-events-auto ring-black ring-1 ring-opacity-5 w-80">
            <div class="p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <codicon:error v-if="item.type === 'error'" class="w-6 h-6 text-red-400" aria-hidden="true" />
                  <bx-error-circle v-if="item.type === 'warning'" class="w-6 h-6 text-orange-400" aria-hidden="true" />
                  <CheckCircleIcon v-if="item.type === 'success'" class="w-6 h-6 text-green-400" aria-hidden="true" />
                </div>
                <div class="flex-1 ml-3 pt-0.5 w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.title }}
                  </p>
                </div>
                <div class="flex flex-shrink-0 ml-4">
                  <button type="button" class="inline-flex text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" @click="removeItem(item)">
                    <span class="sr-only">Close</span>
                    <XMarkIcon class="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="stylus">
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}

</style>
