<script setup lang="ts">
import { inject, Ref, ref } from 'vue'
import OnlineList from './OnlineList.vue'
import ChatMessages from './ChatMessages.vue'
import ChatInput from './ChatInput.vue'
import type {Msg} from '../hooks/socket'
import type Peer from 'simple-peer'
const userId = inject('userId')as Ref<string>
const onlienUser = inject('onlienUser') as Ref<string[]>
const receivedMessage = inject('receivedMessage') as Ref<Msg[]>
const peerMap = inject('peerMap') as Map<string, Peer.Instance>
  const sendMessage = (msg: string) => {
  receivedMessage.value.push({id:userId.value,data:msg,type:'text',timestamp:Date.now()})
  for(const item of peerMap.keys()){
    console.log(item);
    peerMap.get(item)!.send(msg)
  }
}


const inputContainerHeight = ref(160)
const isResizing = ref(false)
let startY = 0
let startHeight = 0

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startY = e.clientY
  startHeight = inputContainerHeight.value
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const delta = startY - e.clientY
  const newHeight = Math.min(Math.max(startHeight + delta, 120), 400)
  inputContainerHeight.value = newHeight
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

</script>

<template>
  <div class="chat-container">
    <div class="chat-main">
      <ChatMessages :messages="receivedMessage" />
      <div 
        class="input-container"
        :style="{ height: `${inputContainerHeight}px` }"
      >
        <div 
          class="resize-handle"
          @mousedown="startResize"
          :class="{ 'resizing': isResizing }"
        ></div>
        <ChatInput @send="sendMessage" />
      </div>
    </div>
    <OnlineList :users="onlienUser" class="online-list" />
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex: 1;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  gap: 1.5rem;
  padding: 1.5rem;
  box-sizing: border-box;
}

.chat-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--chat-bg);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 120px);
}

.messages-container {
  flex: 1;
  min-height: 200px;
  overflow: hidden;
  position: relative;
}

.input-container {
  position: relative;
  transition: height 0.05s ease;
  min-height: 160px;
}

.resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--border-color);
  cursor: row-resize;
  z-index: 1;
}

.resize-handle:hover,
.resize-handle.resizing {
  background: var(--primary-color);
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .chat-main {
    height: calc(100vh - 200px);
  }

  .online-list {
    order: -1;
    width: 100% !important;
    max-height: 150px !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .chat-container {
    max-width: 100%;
    padding: 1rem;
  }
}

@media (min-width: 1920px) {
  .chat-container {
    max-width: 1800px;
  }
}
</style>