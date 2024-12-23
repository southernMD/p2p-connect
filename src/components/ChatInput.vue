<script setup lang="ts">
import { ref } from 'vue'

const $emit = defineEmits<{
  send: [content: string]
  openLink: [flag:Boolean]
}>()

const message = ref('')

const sendMessage = () => {
  if (message.value.trim()) {
    $emit('send', message.value)
    message.value = ''
  }
}

const openLink = (flag:boolean)=>{
  $emit('openLink',flag)
}
</script>

<template>
  <div class="chat-input">
    <div class="toolbar" draggable="false">
      <button class="tool-btn" @click="openLink(true)">📄</button>
      <button class="tool-btn" @click="openLink(false)">📁</button>
    </div>
    <div class="input-area">
      <textarea
        v-model="message"
        @keydown.enter.prevent="sendMessage"
        placeholder="输入消息..."
      ></textarea>
      <button @click="sendMessage" class="send-btn">发送</button>
    </div>
  </div>
</template>

<style scoped>
.chat-input {
  border-top: 1px solid var(--border-color);
  padding: 1rem;
  background: var(--input-bg);
  height: 100%;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  user-select: none;
}

.tool-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.tool-btn:hover {
  background: var(--hover-bg);
}

.input-area {
  display: flex;
  gap: 0.5rem;
  height: 75%;
}

textarea {
  flex: 1;
  height: 100px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  background: var(--textarea-bg);
  color: var(--text-color);
  height:auto;
}

.send-btn {
  padding: 0.5rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end;
}

.send-btn:hover {
  opacity: 0.9;
}
</style>