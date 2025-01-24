<script setup lang="ts">
import { ElScrollbar } from 'element-plus'
import { inject, nextTick, onMounted, Ref, ref, watch } from 'vue'
import FileMessage from './FileMessage.vue'
import { Msg } from '../hooks/socket';
const userId = inject('userId')
const props = defineProps<{
  messages: Msg[]
}>()

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const messagesRef = ref() as Ref<HTMLElement>


const scrollToBottom = () => {
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(messagesRef.value.clientHeight)
  }
}

watch(()=>props.messages,()=>{
  nextTick(()=>{
    scrollToBottom()
  })
},{deep:true})

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <ElScrollbar ref="scrollbarRef" class="messages-scrollbar">
    <div class="messages" ref="messagesRef">
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
@media (max-width: 768px) {
  .messages {
    height: 300px;
  }
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