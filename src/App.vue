<script setup lang="ts">
import ChatRoom from './components/ChatRoom.vue'
import ChatHeader from './components/ChatHeader.vue'
import { provide, ref } from 'vue';
import useSocketConnect from '@/hooks/socketConnect'
import { fileTypeFromBlob } from 'file-type';
import JSZip from 'jszip';
const userId = ref('Alice')
const onlienUser = ref([])
const receivedMessage = ref([])
let peerMap: Map<string, any> = new Map()
useSocketConnect(onlienUser, userId, receivedMessage, peerMap)
provide('userId', userId)
provide('onlienUser', onlienUser)
provide('receivedMessage', receivedMessage)
provide('peerMap', peerMap)

const isDragging = ref(false)
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDragLeave = () => {
  isDragging.value = false
}
const folderAnalysis = async (entry: FileSystemEntry, zip: JSZip, path: string = '') => {
  if (entry?.isFile) {
    // 如果是文件，直接添加到 zip
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((resolve, reject) => {
      fileEntry.file((file) => resolve(file), reject);
    });
    console.log(path + file.name,file);
    // 读取文件内容并添加到 ZIP 文件中
    zip.file(path + file.name, file);
  } else if (entry?.isDirectory) {
    // 如果是目录，递归遍历文件夹
    const directoryEntryReader = (entry as FileSystemDirectoryEntry).createReader();
    await new Promise<void>((resolve) => {
      directoryEntryReader.readEntries(async (entries) => {
        for (const entry of entries) {
          if(entry.isDirectory){
            await folderAnalysis(entry, zip, path + entry.name + '/');
          }else if(entry.isFile){
            await folderAnalysis(entry, zip, path + '/');
          }
        }
        resolve()
      });
    })
  }
};

const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  const items = e.dataTransfer?.items;
  if (items && items.length > 0) {
    const zip = new JSZip();
    const entries: FileSystemEntry[] = [];
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
    debugger
    for await(const entry of entries){
      if (entry?.isDirectory) {
        // 处理文件夹
        await folderAnalysis(entry, zip,entry.name + '/');
      } else if (entry?.isFile) {
        // 处理单个文件
        const fileEntry = entry as FileSystemFileEntry;
        const file = await new Promise<File>((resolve, reject) => {
          fileEntry.file((file) => resolve(file), reject);
        });
        console.log(file);
        // 读取文件内容并添加到 ZIP 文件中
        zip.file(file.name, file);
      }
    }
    // 生成并下载 ZIP 文件
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const a = document.createElement('a');
      const url = URL.createObjectURL(content);
      a.href = url;
      a.download = 'uploaded_files.zip';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
};


</script>

<template>
  <div class="app-container" webkitdirectory @dragenter="handleDragEnter" @dragover="handleDragOver"
    @dragleave="handleDragLeave" @drop="handleDrop">
    <!-- <PusherTalk></PusherTalk> -->
    <!-- <SimplePeerTalk></SimplePeerTalk> -->
    <!-- <Base></Base> -->
    <ChatHeader />
    <ChatRoom />
  </div>
</template>

<style>
body {
  margin: 0;
  background: #f5f5f5;
  color: #333;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>