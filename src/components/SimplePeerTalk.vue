<script setup lang="ts">
import Peer from 'simple-peer'
import base64 from 'base64-js'
import { ref } from 'vue'

const connectionPeer = ref()
const inputSignal = ref('') // 用于输入对方的信令数据
const generatedSignal = ref('') // 保存本地生成的信令数据
const isInitiator = ref(false)

const stunServers = [
  { urls: 'stun:stun.sipnet.net:3478' },
  { urls: 'stun:stun.verbo.be:3478' },
  { urls: 'stun:stun.antisip.com:3478' },
  { urls: 'stun:stun.ncic.com:3478' },
  { urls: 'stun:stun.meetwife.com:3478' },
  { urls: 'stun:stun.3deluxe.de:3478' },
  { urls: 'stun:stun.signalwire.com:3478' },
  { urls: 'stun:stun.bitburger.de:3478' },
  { urls: 'stun:stun.sonetel.com:3478' },
  { urls: 'stun:stun.imp.ch:3478' },
  { urls: 'stun:stun.diallog.com:3478' },
  { urls: 'stun:stun.geesthacht.de:3478' },
  { urls: 'stun:stun.sipnet.com:3478' },
  { urls: 'stun:stun.axialys.net:3478' },
  { urls: 'stun:stun.root-1.de:3478' },
  { urls: 'stun:stun.sonetel.net:3478' },
  { urls: 'stun:stun.kanojo.de:3478' },
  { urls: 'stun:stun.nextcloud.com:3478' },
  { urls: 'stun:stun.romaaeterna.nl:3478' },
  { urls: 'stun:stun.ru-brides.com:3478' },
  { urls: 'stun:stun.mixvoip.com:3478' },
  { urls: 'stun:stun.skydrone.aero:3478' },
  { urls: 'stun:stun.lleida.net:3478' },
  { urls: 'stun:stun.atagverwarming.nl:3478' },
  { urls: 'stun:stun.vavadating.com:3478' },
  { urls: 'stun:stun.f.haeder.net:3478' },
  { urls: 'stun:stun.peeters.com:3478' },
  { urls: 'stun:stun.ipfire.org:3478' },
  { urls: 'stun:stun.threema.ch:3478' },
  { urls: 'stun:stun.telnyx.com:3478' },
  { urls: 'stun:stun.zepter.ru:3478' },
  { urls: 'stun:stun.oncloud7.ch:3478' },
  { urls: 'stun:stun.healthtap.com:3478' },
  { urls: 'stun:stun.heeds.eu:3478' },
  { urls: 'stun:stun.technosens.fr:3478' },
  { urls: 'stun:stun.business-isp.nl:3478' },
  { urls: 'stun:stun.myspeciality.com:3478' },
  { urls: 'stun:stun.thinkrosystem.com:3478' },
  { urls: 'stun:stun.graftlab.com:3478' },
  { urls: 'stun:stun.dcalling.de:3478' },
  { urls: 'stun:stun.siptrunk.com:3478' },
  { urls: 'stun:stun.freeswitch.org:3478' },
  { urls: 'stun:stun.bridesbay.com:3478' },
  { urls: 'stun:stun.voip.blackberry.com:3478' },
  { urls: 'stun:stun.annatel.net:3478' },
  { urls: 'stun:stun.kaseya.com:3478' },
  { urls: 'stun:stun.linuxtrent.it:3478' },
  { urls: 'stun:stun.cope.es:3478' },
  { urls: 'stun:stun.voipgate.com:3478' },
  { urls: 'stun:stun.voztovoice.org:3478' },
  { urls: 'stun:stun.allflac.com:3478' },
  { urls: 'stun:stun.radiojar.com:3478' },
  { urls: 'stun:stun.nanocosmos.de:3478' },
  { urls: 'stun:stun.studio-link.de:3478' },
  { urls: 'stun:stun.poetamatusel.org:3478' },
  { urls: 'stun:stun.stochastix.de:3478' },
  { urls: 'stun:stun.jowisoftware.de:3478' },
  { urls: 'stun:stun.godatenow.com:3478' },
  { urls: 'stun:stunserver2024.stunprotocol.org:3478' },
  { urls: 'stun:stun.siplogin.de:3478' },
  { urls: 'stun:stun.pure-ip.com:3478' },
  { urls: 'stun:stun.lovense.com:3478' },
  { urls: 'stun:stun.ukh.de:3478' },
  { urls: 'stun:stun.piratenbrandenburg.de:3478' },
  { urls: 'stun:stun.1cbit.ru:3478' },
  { urls: 'stun:stun.genymotion.com:3478' },
  { urls: 'stun:stun.zentauron.de:3478' },
  { urls: 'stun:stun.sipnet.ru:3478' },
  { urls: 'stun:stun.engineeredarts.co.uk:3478' },
  { urls: 'stun:stun.ttmath.org:3478' },
  { urls: 'stun:stun.3wayint.com:3478' },
  { urls: 'stun:stun.ringostat.com:3478' },
  { urls: 'stun:stun.streamnow.ch:3478' },
  { urls: 'stun:stun.alpirsbacher.de:3478' },
  { urls: 'stun:stun.moonlight-stream.org:3478' },
  { urls: 'stun:stun.voipia.net:3478' },
  { urls: 'stun:stun.frozenmountain.com:3478' },
  { urls: 'stun:stun.bethesda.net:3478' },
  { urls: 'stun:stun.peethultra.be:3478' },
  { urls: 'stun:stun.romancecompass.com:3478' },
  { urls: 'stun:stun.sip.us:3478' },
  { urls: 'stun:stun.nextcloud.com:443' },
  { urls: 'stun:stun.fitauto.ru:3478' },
  { urls: 'stun:stun.synergiejobs.be:3478' },
  { urls: 'stun:stun.avigora.fr:3478' },
  { urls: 'stun:stun.files.fm:3478' },
  { urls: 'stun:stun.flashdance.cx:3478' },
  { urls: 'stun:stun.uabrides.com:3478' },
  { urls: 'stun:stun.yesdates.com:3478' },
  { urls: 'stun:stun.m-online.net:3478' },
  { urls: 'stun:stun.acronis.com:3478' },
  { urls: 'stun:stun.baltmannsweiler.de:3478' },
  { urls: 'stun:stun.hot-chilli.net:3478' },
]

// 发起连接
const go = () => {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    config:{
      // iceServers: stunServers
      iceServers: [{"urls":"stun:stun.sipnet.net:3478"}]
    }
  })

  // 生成本地信令数据并保存到 generatedSignal
  peer.on('signal', (data) => {
    // const encodedSignal = base64.fromByteArray(new Uint8Array(new TextEncoder().encode(JSON.stringify(data))))
    const encodedSignal = JSON.stringify(data)
    generatedSignal.value = encodedSignal // 编码后的信令
    console.log('Generated Signal (Base64 Encoded):', encodedSignal)
  })

  // 当连接建立时通过 DataChannel 发送数据
  peer.on('connect', () => {
    console.log('Connection established! Sending data...')
    peer.send('Hello from initiator') // 发送数据
  })

  // 监听 DataChannel 接收数据
  peer.on('data', (data) => {
    alert('Received data:'+data.toString())
  })

  connectionPeer.value = peer
  isInitiator.value = true
}

// 接受连接
const get = () => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    config:{
      // iceServers: stunServers
      iceServers: [{"urls":"stun:stun.sipnet.net:3478"}]
    }
  })

  // 生成本地信令数据并保存到 generatedSignal
  peer.on('signal', (data) => {
    // const encodedSignal = base64.fromByteArray(new Uint8Array(new TextEncoder().encode(JSON.stringify(data))))
    const encodedSignal = JSON.stringify(data)
    generatedSignal.value = encodedSignal // 编码后的信令
    console.log('Generated Signal (Base64 Encoded):', encodedSignal)
  })

  // 监听 DataChannel 接收数据
  peer.on('data', (data) => {
    alert('Received data:'+data.toString())
  })

  // 使用输入的信令数据解码并连接
  // const decodedSignal = JSON.parse(new TextDecoder().decode(base64.toByteArray(inputSignal.value)))
  const decodedSignal = JSON.parse(inputSignal.value)
  peer.signal(decodedSignal)

  connectionPeer.value = peer
  isInitiator.value = false
}

// 处理后续信令交换
const signalExchange = () => {
  if (connectionPeer.value) {
    // const decodedSignal = JSON.parse(new TextDecoder().decode(base64.toByteArray(inputSignal.value)))
  const decodedSignal = JSON.parse(inputSignal.value)
    connectionPeer.value.signal(decodedSignal)
  }
}

const msg = ref('')
const send = ()=>{
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
    <textarea v-model="inputSignal" rows="5" placeholder="在这里输入对方的信令数据"></textarea>
    <button @click="get">接受</button>

    <h3>信令交换</h3>
    <button @click="signalExchange">继续交换信令</button>

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
