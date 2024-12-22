<script setup lang="ts">
import Peer from 'simple-peer'
import base64 from 'base64-js'
import { ref, onMounted } from 'vue'
import Pusher from 'pusher-js'

const connectionPeer = ref()
const generatedSignal = ref('') // 保存本地生成的信令数据
const isInitiator = ref(false)
const msg = ref('')

const channelName = 'peer-channel' // Pusher频道名称

// 初始化Pusher客户端
let pusher: Pusher
let channel: Pusher.Channel

const initPusher = () => {
  pusher = new Pusher('af5cb074fccdfc96f092', {
    cluster: 'ap1',  // Pusher的集群
  })
  channel = pusher.subscribe(channelName)

  // 监听接收到的信令数据
  channel.bind('signal-receive', (data: { signal: string }) => {
    const decodedSignal = JSON.parse(new TextDecoder().decode(base64.toByteArray(data.signal)))
    if (connectionPeer.value) {
      connectionPeer.value.signal(decodedSignal)
    }
  })
}

onMounted(() => {
  initPusher()
})

// 发起连接
const go = () => {
  const peer = new Peer({
    initiator: true,
    trickle: false,
  })

  // 生成本地信令数据并保存到 generatedSignal
  peer.on('signal', (data) => {
    const encodedSignal = base64.fromByteArray(new Uint8Array(new TextEncoder().encode(JSON.stringify(data))))
    generatedSignal.value = encodedSignal // 编码后的信令
    console.log('Generated Signal (Base64 Encoded):', encodedSignal)

    // 发送信令到Pusher
    channel.trigger('client-signal-send', {
      signal: encodedSignal
    })
  })

  // 当连接建立时通过 DataChannel 发送数据
  peer.on('connect', () => {
    console.log('Connection established! Sending data...')
    peer.send('Hello from initiator') // 发送数据
  })

  // 监听 DataChannel 接收数据
  peer.on('data', (data) => {
    alert('Received data: ' + data.toString())
  })

  connectionPeer.value = peer
  isInitiator.value = true
}

// 接受连接
const get = () => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
  })

  // 生成本地信令数据并保存到 generatedSignal
  peer.on('signal', (data) => {
    const encodedSignal = base64.fromByteArray(new Uint8Array(new TextEncoder().encode(JSON.stringify(data))))
    generatedSignal.value = encodedSignal // 编码后的信令
    console.log('Generated Signal (Base64 Encoded):', encodedSignal)

    // 发送信令到Pusher
    channel.trigger('client-signal-send', {
      signal: encodedSignal
    })
  })

  // 监听 DataChannel 接收数据
  peer.on('data', (data) => {
    alert('Received data: ' + data.toString())
  })

  connectionPeer.value = peer
  isInitiator.value = false
}

// 发送消息
const send = () => {
  connectionPeer.value.send(msg.value)
}
</script>

<template>
  <div>
    <h3>发起连接</h3>
    <button @click="go">发起</button>
    <p>生成的信令数据（发送给对方）:</p>
    <textarea v-model="generatedSignal" rows="5" readonly></textarea>

    <h3>接受连接</h3>
    <button @click="get">接受</button>

    <h3>信令交换</h3>
    <textarea rows="5" v-model="msg"></textarea>
    <button @click="send">发送数据</button>
  </div>
</template>

<style scoped>
textarea {
  width: 100%;
  margin-bottom: 1rem;
}

button {
  margin-bottom: 1rem;
}
</style>
