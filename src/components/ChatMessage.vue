<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import FileMessage from './FileMessage.vue'
import { Msg } from '../hooks/socket';
const userId = inject('userId')
const props = defineProps<{
  messages: Msg[]
}>()

const scrollbarRef = ref()

const scrollToBottom = () => {
  if (scrollbarRef.value) {
    const scrollbar = scrollbarRef.value.$el
    scrollbar.scrollTop = scrollbar.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <ElScrollbar ref="scrollbarRef" class="messages-scrollbar">
    <div class="messages">
      <div v-for="message in messages" :key="message.id" class="message">
        <div class="message-header">
          <span class="user" :class="{ 'user-my': message.id == userId }">{{ message.id }}</span>
          <span class="time">{{ new Date(message.timestamp).toLocaleTimeString() }}</span>
        </div>
        <div class="content">
          <template v-if="message.type.startsWith('file')">
            <FileMessage :message="message" />
          </template>
          <template v-else>
            {{ message.data }}
          </template>
        </div>
      </div>
    </div>
  </ElScrollbar>
</template>

<style scoped>
.messages-scrollbar {
  flex: 1;
  height: 100%;
}

.messages {
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.user {
  font-weight: bold;
  color: var(--primary-color);
}

.user-my {
  color: var(--oneself-color);
}

.time {
  font-size: 0.8rem;
  color: #666;
}

.content {
  background: var(--hover-bg);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: var(--text-color);
}

html.dark .time {
  color: #999;
}
</style>