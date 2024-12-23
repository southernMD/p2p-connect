<script setup lang="ts">

import { useDark, useToggle } from '@vueuse/core'
import { ElButton,ElInput } from 'element-plus';
import { inject, ref, watch } from 'vue';
        // :active-icon="'🌙'"
        // :inactive-icon="'☀️'"
const isDark = useDark()
const toggleDark = useToggle(isDark)
const userId = inject('userId')
const aboutDialogVisible = ref(false)
const sleepValue = ref(localStorage.getItem('sleepValue') ?? 500)
watch(sleepValue,()=>{
  localStorage.setItem('sleepValue',sleepValue.value+"")
})
</script>

<template>
  <header class="chat-header">
    <h1>数据传输助手 你的ID：<span style="color: var(--oneself-color);"> {{ userId }}</span></h1>
    <div class="header-controls">
      <div class="sleep">sleep时间</div>
      <ElInput class="sleep-input" v-model="sleepValue" placeholder="设置sleep的时间(ms)，不建议低于100"></ElInput>
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
        <p>大文件上传可能会导致p2p传输失败，因为我没有想到好的办法去监视p2p传播的流量，因此暂时使用设置sleep的方式解决</p>
        <p><a href="https://github.com/southernMD/p2p-connect" target="_blank">github</a></p>
      </div>
    </ElDialog>
  </header>
  <div class="chat-id"><h1>数据传输助手 你的ID：<span style="color: var(--oneself-color);"> {{ userId }}</span></h1></div>

</template>

<style scoped>
.chat-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
  width: 100vw;
  word-break: break-all;
}
.chat-id{
  width: 100vw;
  background: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  border-top: 1px solid var(--border-color);
  margin-top: 1em;
  padding: 1rem 1.5rem;
  display: none;
  h1{
    font-size: 1.25rem;
    margin: 0;
    color: var(--text-color);
    word-break: break-all;
  }
}
@media (max-width: 768px) {
  .chat-id{
    display: block;
  }
  .chat-header >h1{
    display: none;
  }
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
  margin-right: 1em;
}
.header-controls{
  display: flex;
  .sleep{
    width: 120px;
    font-size: 12px;
    color: var(--text-color);
    display: flex;
    align-items: center;
  }
  .sleep-input{
    margin-right: 1em;
  }
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