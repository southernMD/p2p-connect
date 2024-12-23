<script setup lang="ts">

import { useDark, useToggle } from '@vueuse/core'
import { ElButton } from 'element-plus';
import { inject, ref } from 'vue';
        // :active-icon="'🌙'"
        // :inactive-icon="'☀️'"
const isDark = useDark()
const toggleDark = useToggle(isDark)
const userId = inject('userId')
const aboutDialogVisible = ref(false)
</script>

<template>
  <header class="chat-header">
    <h1>数据传输助手 你的ID：<span style="color: var(--oneself-color);"> {{ userId }}</span></h1>
    <div class="header-controls">
      <ElButton class="about-btn" @click="aboutDialogVisible = true" type="primary">关于</ElButton>
      <ElSwitch
        v-model="isDark"
        @change="toggleDark"
        class="dark-mode-switch"
      />
    </div>
    <ElDialog
      v-model="aboutDialogVisible"
      title="关于"
      width="300px"
      align-center
    >
      <div class="about-content">
        <h3>数据传输助手 v1.0.0</h3>
        <p>一个简单的采用simple-peer(webrtc)与webSocket(socket.io)实现的局域网文件传输</p>
        <p><a href="https://github.com/southernMD/p2p-connect" target="_blank">github</a></p>
      </div>
    </ElDialog>
  </header>
</template>

<style scoped>
.chat-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
}

.chat-header h1 {
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-color);
}

:deep(.dark-mode-switch) {
  --el-switch-on-color: #409eff;
}

@media (max-width: 768px) {
  .chat-header {
    padding: 0.75rem 1rem;
  }

  .chat-header h1 {
    font-size: 1.1rem;
  }
}

.about-btn{
  margin-right: 2em;
}
.header-controls{
  display: flex;
}
.about-content{
  a{
    color: black;
    text-decoration:none;
  }
  a:hover{
    color: var(--primary-color);
  }
}
</style>