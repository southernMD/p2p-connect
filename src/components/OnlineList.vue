<script setup lang="ts">
import { inject, ref } from 'vue';

const userId = inject('userId')

defineProps<{
  users: string[]
}>()
</script>

<template>
  <div class="online-list">
    <h2>在线用户</h2>
    <ElScrollbar>
      <ul>
        <li v-for="user in users" :key="user" class="user-item">
          <span class="status-dot"></span>
          <span class="user-name" :class="{'user-name-me':user == userId}">{{ `${user}${user == userId?'（你）':''}` }}</span>
        </li>
      </ul>
    </ElScrollbar>
  </div>
</template>

<style scoped>
.online-list {
  width: 280px;
  background: var(--chat-bg);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

h2 {
  font-size: 1.2rem;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

:deep(.el-scrollbar) {
  flex: 1;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  gap: 0.5rem;
  max-width: 100%;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
}



.user-name {
  font-size: 0.9rem;
  color: var(--text-color);
  display: inline-block;
  width: 90%;
  overflow: hidden;
}
.user-name-me{
  color: var(--oneself-color);
}

@media (max-width: 768px) {
  .online-list {
    padding: 0.75rem;
  }

  h2 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
}
</style>