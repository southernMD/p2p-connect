<script setup lang="ts">
import { ElMessage, ElScrollbar } from 'element-plus'
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

watch(() => props.messages.length, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})

const copyText = async (msg:string)=>{
  try {
    await navigator.clipboard.writeText(msg)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
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
            <pre>{{ message.data! }}</pre>
            <svg viewBox="0 0 24 24" width="20" height="20" @click="copyText(message.data!)">
              <path
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                fill="currentColor">
              </path>
            </svg>
          </template>
        </div>
      </div>
    </div>
  </ElScrollbar>
</template>

<style scoped>
pre {
  font-family: inherit;
  margin: 0;
}

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
  position: relative;
}
.content svg{
  padding: 4px;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
  right: 1em;
  cursor: pointer;
}
.content svg:hover{
  background-color: var(--copy-hover-bg);
}
html.dark .time {
  color: #999;
}
</style>