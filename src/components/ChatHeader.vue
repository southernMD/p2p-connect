<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { inject } from 'vue';
        // :active-icon="'🌙'"
        // :inactive-icon="'☀️'"
const isDark = useDark()
const toggleDark = useToggle(isDark)
const userId = inject('userId')
</script>

<template>
  <header class="chat-header">
    <h1>聊天室 你的ID：<span style="color: var(--oneself-color);"> {{ userId }}</span></h1>
    <div class="header-controls">
      <ElSwitch
        v-model="isDark"
        @change="toggleDark"
        class="dark-mode-switch"
      />
    </div>
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
</style>