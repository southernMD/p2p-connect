<script setup lang="ts">
import { computed, inject } from 'vue';
import { Msg } from '../hooks/socket';
import { ElImage } from 'element-plus';

const props = defineProps<{
  message:Msg
}>()
const userId = inject('userId')
const fileBlob = computed(() => {
  return URL.createObjectURL(props.message.fileBlob!)
})

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const imgShow = computed(() => {
  return props.message.type === 'file-end-image' || (props.message.type == 'file-image' && props.message.fileBlob)
})

const status = computed(()=>{
  return !props.message.type.includes("end")?'status-uploading':'status-success'
})

const progressStatus = computed(()=>{
  return !props.message.type.includes("end")?'progress-fill-uploading':'progress-fill-success'
})

</script>

<template>
  <div class="file-message">
    <div class="file-preview">
      <el-image v-if="imgShow"
      :src="fileBlob"
      :preview-src-list="[fileBlob]"
      style="width: 100%; height: 100%"
      ></el-image>
      <div class="file-icon" v-else>
        📄
      </div>
    </div>
    <div class="file-info">
      <div class="file-header">
        <div class="file-name">{{ message.fileName }}</div>
        <a v-if="message.id != userId && (!message.progress || Number(message.progress) === 100)"
           :href="fileBlob"
           :download="message.fileName"
           class="download-btn"
           title="下载文件">
          ⬇️
        </a>
      </div>
      <div class="file-size">{{ formatFileSize(message.fileSize!) }}</div>
      <div v-if="message.progress !== undefined && Number(message.progress) <= 100" 
           class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill"  :class="[progressStatus]"
               :style="{ width: `${message.progress}%` }"></div>
        </div>
        <span class="progress-text">{{ message.progress }}%</span>
      </div>
      <!-- :class="['file-status', `status-${message.status}`]"> -->

      <div :class="['file-status', status]">
        <span class="error-message">
          {{ message.loadMsg }}
        </span>
      </div>
    </div>
  </div>
</template>


<style scoped>
.file-message {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--hover-bg);
  border-radius: 4px;
  max-width: 400px;
}

.file-preview {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--chat-bg);
  border-radius: 4px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon {
  font-size: 2rem;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.file-name {
  font-weight: 500;
  word-break: break-all;
  flex: 1;
}

.download-btn {
  font-size: 1.2rem;
  text-decoration: none;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.download-btn:hover {
  background: var(--chat-bg);
}

.file-size {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}
.progress-fill-uploading {
  background: var(--primary-color);
}

.progress-fill-success {
  background: #4caf50;
}

.progress-text {
  font-size: 0.85rem;
  color: #666;
  min-width: 40px;
}

.file-status {
  font-size: 0.85rem;
  padding: 0.25rem 0;
}

.status-uploading {
  color: var(--primary-color);
}

.status-success {
  color: #4caf50;
}

.status-error {
  color: #f44336;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

html.dark .file-size,
html.dark .progress-text {
  color: #999;
}
</style>