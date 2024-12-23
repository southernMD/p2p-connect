<script setup lang="ts">
import ChatRoom from './components/ChatRoom.vue'
import ChatHeader from './components/ChatHeader.vue'
import { provide, Ref, ref } from 'vue';
import useSocketConnect from '@/hooks/socketConnect'
import JSZip from 'jszip';
import { Msg } from './hooks/socket';
import { v4 as uuidv4 } from 'uuid';
const userId = ref('Alice')
const onlienUser = ref([])
const receivedMessage = ref([]) as Ref<Msg[]>

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
const handleDrop = async (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false
  const items = e.dataTransfer?.items;
  if (items && items.length > 0) {
    const item = items[0].webkitGetAsEntry()
    if (!item) {
    } else {
      if (items.length == 1 && !(items[0].webkitGetAsEntry()?.isDirectory)) {
        const newFileArrayMsg = ref({
          id: userId.value,
          type: 'file',
          timestamp: new Date().getTime(),
          loadMsg: '',
          progress: '',
          msgId: uuidv4(),
          fileSize: 0
        })
        receivedMessage.value.push(newFileArrayMsg.value)
        await uploadFile(items, newFileArrayMsg)
      }
      else {
        const newFileArrayMsg = ref({
          id: userId.value,
          type: 'file',
          timestamp: new Date().getTime(),
          loadMsg: '',
          progress: '',
          msgId: uuidv4(),
          fileSize: 0,
          fileName: new Date().getTime() + '.zip',
        })
        receivedMessage.value.push(newFileArrayMsg.value)
        await zipUploadFiles(items, newFileArrayMsg)
      }
    }
  }

};

const folderAnalysis = async (entry: FileSystemEntry, zip: JSZip, path: string = '', newFileArrayMsg: Ref<Msg>) => {
  if (entry?.isFile) {
    // 如果是文件，直接添加到 zip
    const fileEntry = entry as FileSystemFileEntry;
    const file = await new Promise<File>((resolve, reject) => {
      fileEntry.file((file) => resolve(file), reject);
    });
    newFileArrayMsg.value.loadMsg = "正在处理文件" + file.name
    newFileArrayMsg.value.fileSize! += file.size
    const fileBlob = await fileSteamToBlob(file, newFileArrayMsg, false)
    // 读取文件内容并添加到 ZIP 文件中
    zip.file(path + file.name, fileBlob);
  } else if (entry?.isDirectory) {
    // 如果是目录，递归遍历文件夹
    const directoryEntryReader = (entry as FileSystemDirectoryEntry).createReader();
    await new Promise<void>((resolve) => {
      directoryEntryReader.readEntries(async (entries) => {
        for (const entry of entries) {
          if (entry.isDirectory) {
            await folderAnalysis(entry, zip, path + entry.name + '/', newFileArrayMsg);
          } else if (entry.isFile) {
            await folderAnalysis(entry, zip, path + '/', newFileArrayMsg);
          }
        }
        resolve()
      });
    })
  }
};
const zipUploadFiles = async (items: DataTransferItemList, newFileArrayMsg: Ref<Msg>) => {
  const zip = new JSZip();
  const entries: FileSystemEntry[] = [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    if (entry) entries.push(entry);
  }
  for await (const entry of entries) {
    if (entry?.isDirectory) {
      // 处理文件夹
      await folderAnalysis(entry, zip, entry.name + '/', newFileArrayMsg);
    } else if (entry?.isFile) {
      // 处理单个文件
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file((file) => resolve(file), reject);
      });
      newFileArrayMsg.value.loadMsg = "正在处理文件" + file.name
      newFileArrayMsg.value.fileSize! += file.size
      const fileBlob = await fileSteamToBlob(file, newFileArrayMsg, false)
      console.log(file);
      // 读取文件内容并添加到 ZIP 文件中
      zip.file(file.name, fileBlob);
    }
  }
  createZipStream(zip, newFileArrayMsg)
}

const uploadFile = async (item: DataTransferItemList, newFileArrayMsg: Ref<Msg>) => {
  const entrie: FileSystemFileEntry = item[0].webkitGetAsEntry() as FileSystemFileEntry
  const file = await new Promise<File>((resolve, reject) => {
    entrie.file((file) => resolve(file), reject);
  });
  newFileArrayMsg.value.loadMsg = file.name
  newFileArrayMsg.value.fileName = file.name
  newFileArrayMsg.value.fileSize = file.size
  console.log(file.type);
  const imgFlag = file.type.includes('image') ? true : false
  if (imgFlag) newFileArrayMsg.value.type += '-image'
  await fileSteamToBlob(file, newFileArrayMsg, true, imgFlag)
  // triggerDownload(fileBlob,file.type.split("/")[1])
}

const createZipStream = (zip: JSZip, newFileArrayMsg: Ref<Msg>) => {
  return new ReadableStream({
    start(controller) {
      const stream = zip.generateInternalStream({ type: 'blob', streamFiles: true });
      stream.accumulate((chunk) => {
        // console.log(chunk.percent);
        newFileArrayMsg.value.loadMsg = "正在合并文件"
        newFileArrayMsg.value.progress = chunk.percent.toFixed(2)
      }).then((content) => {
        peerMap.forEach((peer) => {
          peer.send(JSON.stringify({
            type: 'file-start',
            id: userId.value,
            loadMsg: newFileArrayMsg.value.loadMsg,
            msgId: newFileArrayMsg.value.msgId,
            timestamp: Date.now(),
            fileSize: content.size
          }))
        })
        // 逐步将内容流式传输到控制器
        const totalSize = content.size;
        const reader = content.stream().getReader();
        let totalRead = 0;
        const chunks: any[] = [];
        const chunkSize = 16 * 1024;
        const maxChunkTotalSize = 256 * 1024;
        let totalSentSize = 0;  // 当前已发送的总字节数
        function push() {
          reader.read().then(async ({ done, value }) => {
            if (done) {
              controller.close();
              // const blob = new Blob(chunks);
              newFileArrayMsg.value.loadMsg = "文件传输完成"
              newFileArrayMsg.value.type = 'file-end'
              peerMap.forEach((peer) => {
                peer.send(JSON.stringify({
                  type: 'file-end',
                  msgId: newFileArrayMsg.value.msgId,
                  fileName: new Date().getTime() + '.' + content.type.split("/")[1],
                }))
              })
              // triggerDownloadZip(content);
            } else {
              totalRead += value.length;
              chunks.push(value);
              controller.enqueue(value);
              const progress = (totalRead / totalSize) * 100;
              let offset = 0;
              const sleepTime = localStorage.getItem("sleepValue")?+localStorage.getItem("sleepValue")!:500
              while (offset < value.length) {
                const chunk = value.slice(offset, offset + chunkSize);
                totalSentSize += chunk.length;  // 累加当前 chunk 的大小
                if (totalSentSize > maxChunkTotalSize) {
                  // 如果总发送字节数超过限制，暂停一段时间
                  console.log('Reached 256KB limit, waiting...');
                  await sleep(sleepTime);  // 等待 10ms，具体等待时间可调整
                  totalSentSize = chunk.length;  // 重置 totalSentSize，当前 chunk 开始重新计数
                }

                // 发送数据到所有 peer
                peerMap.forEach((peer) => {
                  peer.send(JSON.stringify({
                    type: 'file-progress',
                    id: userId.value,
                    progress: progress.toFixed(2),
                    loadMsg: newFileArrayMsg.value.loadMsg,
                    msgId: newFileArrayMsg.value.msgId,
                    fileBlob: Array.from(chunk)
                  }));
                });
                offset += chunkSize;  // 更新偏移量，继续传输下一块
                // await sleep(1)
              }
              push();
              // 更新进度条
              newFileArrayMsg.value.loadMsg = "正在上传文件"
              newFileArrayMsg.value.progress = progress.toFixed(2)
              console.log(`Progress: ${progress.toFixed(2)}%`);
            }
          });
        }
        push();
      })
        .catch((error) => {
          console.error(error);
          controller.error(error);
        });
    }
  });
};

const triggerDownloadZip = (content: Blob) => {
  const a = document.createElement('a');
  const url = URL.createObjectURL(content);
  a.href = url;
  a.download = 'uploaded_files.zip';
  a.click();
  URL.revokeObjectURL(url);
};

const triggerDownload = async (content: Blob, name: string) => {
  const a = document.createElement('a');
  const url = URL.createObjectURL(content);
  a.href = url;
  a.download = new Date().getTime() + '.' + name;
  a.click();
  URL.revokeObjectURL(url);
};
const fileSteamToBlob = async (file: File, newFileArrayMsg: Ref<Msg>, flag: boolean, imgFlag = false) => {
  if (flag) {
    peerMap.forEach((peer) => {
      peer.send(JSON.stringify({
        type: 'file-start' + (imgFlag ? '-image' : ''),
        id: userId.value,
        loadMsg: newFileArrayMsg.value.loadMsg,
        msgId: newFileArrayMsg.value.msgId,
        timestamp: Date.now(),
        fileSize: file.size
      }))
    })
  }
  return await new Promise<Blob>((resolve, reject) => {
    new ReadableStream({
      start(controller) {
        const reader = file.stream().getReader();
        let totalRead = 0;
        const totalSize = file.size
        const chunks: any[] = [];
        const chunkSize = 16 * 1024;
        const maxChunkTotalSize = 1024 * 256;
        let totalSentSize = 0;  // 当前已发送的总字节数
        function push() {
          reader.read().then(async ({ done, value }) => {
            if (done) {
              controller.close();
              const blob = new Blob(chunks);
              // console.log(blob);
              resolve(blob);
              if (flag) {
                peerMap.forEach((peer) => {
                  peer.send(JSON.stringify({
                    type: 'file-end' + (imgFlag ? '-image' : ''),
                    msgId: newFileArrayMsg.value.msgId,
                    fileName: new Date().getTime() + '.' + file.type.split("/")[1],
                  }))
                })
                if (imgFlag) newFileArrayMsg.value.fileBlob = blob
                newFileArrayMsg.value.loadMsg = "文件传输完成"
                newFileArrayMsg.value.type = 'file-end' + (imgFlag ? '-image' : '')
              }
            } else {
              totalRead += value.length;
              chunks.push(value);
              controller.enqueue(value);
              const progress = (totalRead / totalSize) * 100;
              const sleepTime = localStorage.getItem("sleepValue")?+localStorage.getItem("sleepValue")!:500
              if (flag) {
                let offset = 0;

                while (offset < value.length) {
                  const chunk = value.slice(offset, offset + chunkSize);
                  totalSentSize += chunk.length;  // 累加当前 chunk 的大小

                  if (totalSentSize > maxChunkTotalSize) {
                    // 如果总发送字节数超过限制，暂停一段时间
                    console.log('Reached 256KB limit, waiting...');
                    await sleep(sleepTime);  // 等待 10ms，具体等待时间可调整
                    totalSentSize = chunk.length;  // 重置 totalSentSize，当前 chunk 开始重新计数
                  }

                  // 发送数据到所有 peer
                  peerMap.forEach((peer) => {
                    peer.send(JSON.stringify({
                      type: 'file-progress' + (imgFlag ? '-image' : ''),
                      id: userId.value,
                      progress: progress.toFixed(2),
                      loadMsg: newFileArrayMsg.value.loadMsg,
                      msgId: newFileArrayMsg.value.msgId,
                      fileBlob: Array.from(chunk)
                    }));
                  });

                  offset += chunkSize;  // 更新偏移量，继续传输下一块
                }
              }
              push();
              // 更新进度条
              newFileArrayMsg.value.progress = progress.toFixed(2)
            }
          });
        }
        push();
      }
    })
  });
};
const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

const openLink = (flag: Boolean) => {
  console.log(flag);
  //flag true 文件 flase文件夹
  if (flag) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // 允许选择多个文件
    input.click()
    input.onchange = async (e) => {
      e.preventDefault()
      const files = input.files;
      if(files){
        const newFileArrayMsg = ref({
          id: userId.value,
          type: 'file',
          timestamp: new Date().getTime(),
          loadMsg: '',
          progress: '',
          msgId: uuidv4(),
          fileSize: 0,
          fileName: new Date().getTime() + '.zip',
        })
        receivedMessage.value.push(newFileArrayMsg.value)
        if(files.length == 1){
          const file = files[0]
          newFileArrayMsg.value.loadMsg = file.name
          newFileArrayMsg.value.fileName = file.name
          newFileArrayMsg.value.fileSize = file.size
          const imgFlag = file.type.includes('image') ? true : false
          if (imgFlag) newFileArrayMsg.value.type += '-image'
          await fileSteamToBlob(file, newFileArrayMsg, true, imgFlag)
        }else{
          const zip = new JSZip()
          for(const file of files){
            newFileArrayMsg.value.loadMsg = "正在处理文件" + file.name
            newFileArrayMsg.value.fileSize! += file.size
            const fileBlob = await fileSteamToBlob(file, newFileArrayMsg, false)
            // 读取文件内容并添加到 ZIP 文件中
            zip.file(file.name, fileBlob);
          }
          createZipStream(zip, newFileArrayMsg)
        }

        input.remove()
      }
    }
  }else{
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; 
    input.webkitdirectory = true; 
    input.click()
    input.onchange = async (e:Event)=>{
      const files = input.files
      
      if(files){
        const newFileArrayMsg = ref({
          id: userId.value,
          type: 'file',
          timestamp: new Date().getTime(),
          loadMsg: '',
          progress: '',
          msgId: uuidv4(),
          fileSize: 0,
          fileName: new Date().getTime() + '.zip',
        })
        receivedMessage.value.push(newFileArrayMsg.value)
        console.log(files);
        const zip = new JSZip()
        for(const file of files){
          const fileBlob = await fileSteamToBlob(file, newFileArrayMsg, false)
          newFileArrayMsg.value.fileSize! += file.size
          zip.file(file.webkitRelativePath, fileBlob)
        }
        createZipStream(zip, newFileArrayMsg)
      }

    }
  }
  // const input = document.createElement('input');
  // input.type = 'file';
  // input.multiple = true; // 允许选择多个文件
  // input.webkitdirectory = true; // 允许选择文件夹（支持文件夹选择）
  // input.click()
  // input.onchange = async (e:Event)=>{
  //   e.preventDefault()
  // }
}
</script>

<template>
  <div class="app-container" webkitdirectory @dragenter="handleDragEnter" @dragover="handleDragOver"
    @dragleave="handleDragLeave" @drop="handleDrop">
    <!-- <PusherTalk></PusherTalk> -->
    <!-- <SimplePeerTalk></SimplePeerTalk> -->
    <!-- <Base></Base> -->
    <ChatHeader />
    <ChatRoom @openLink="openLink" />
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