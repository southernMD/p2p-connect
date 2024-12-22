<script setup lang="ts">
import Peer from 'simple-peer';
import { computed, Ref, ref, watch } from 'vue';
import { io } from 'socket.io-client';
//MESH架构
const socket = io("https://southernmd-p2p-connect.glitch.me"); // WebSocket 服务器地址
const myId = ref(''); // 本地用户的 Socket ID
let peerMap:Map<string,Peer.Instance> = new Map() 
const message = ref(''); // 要发送的消息
const onlienUser = ref([]) as Ref<string[]>
// 接收服务器分配的 ID
socket.on('me', ({ id,userList }:{id:string,userList:string[]}) => {
  myId.value = id;
  console.log(userList);
  onlienUser.value = userList
  //对新的用户创建对所有旧的用户的发起器
  userList?.forEach(item=>{
    console.log(peerMap);
    if(id!=item){
      peerMap.set(item,new Peer({initiator:true, trickle:false}))
      peerMap.get(item)!.on('signal', (signal) => {
        socket.emit('one-user-join-room', {  newSocketId:id, signal,oldSocketId: item});
      })
      peerMap.get(item)!.on('data', (data) => {
        console.log(data);
        receivedMessage.value.push({id:item,msg:data.toString()})
      })
      peerMap.get(item)!.on("connect",()=>{
        console.log("new connect");
      })
    }
  })
  console.log('My ID:', myId.value);
});

socket.on('one-user-joined', ({signal,newSocketId,oldSocketId}) => {
  if(oldSocketId!=myId.value)return
  const peer = new Peer({initiator:false, trickle:false})
  peer.on('signal', (signal) => {
    socket.emit('give-new-user-signal', { newSocketId,signal,oldSocketId:myId.value});
  })
  peer.on("connect",()=>{
    console.log("old connected");
    onlienUser.value.push(newSocketId)
  })
  peer.on('data', (data) => {
    console.log(data);
    
    receivedMessage.value.push({id:newSocketId,msg:data.toString()})
  })
  peer.signal(signal)
  peerMap.set(newSocketId,peer)
})

socket.on('get-old-user-signal',({signal,oldSocketId})=>{
  console.log(signal,oldSocketId);
  peerMap.get(oldSocketId)!.signal(signal)
})

socket.on('user-leave',({id})=>{
  console.log(id+"死了");
  peerMap.get(id)!.destroy()
  peerMap.delete(id)
  onlienUser.value = onlienUser.value.filter(item=>item!=id)
})
//以上是建立双向链接
const receivedMessage:Ref<{id:string,msg:string | any}[]> = ref([]); // 接收到的消息
const sendMessage = () => {
  if(message.value.trim().length ==0)return
  receivedMessage.value.push({id:myId.value,msg:message.value})
  for(const item of peerMap.keys()){
    console.log(item);
    peerMap.get(item)!.send(message.value)
  }
  message.value = ''
}

</script>

<template>
  <div>
    <h3>我的 ID: {{ myId }}</h3>
    <div>
      <div v-for="item in onlienUser">{{ item }}</div>
    </div>
    <div>
      <h4>发送消息</h4>
      <input v-model="message" placeholder="输入消息" />
      <button @click="sendMessage">发送</button>
    </div>

    <div>
      <h4>接收到的消息</h4>
      <p v-for="item in receivedMessage">{{ item.id }}{{ item.msg }}</p>
    </div>
  </div>
</template>

<style scoped>
input {
  margin-right: 1rem;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
  margin-right: 1rem;
  cursor: pointer;
}
p {
  border: 1px solid #ccc;
  padding: 0.5rem;
  background: #f9f9f9;
  word-break: break-word;
}
</style>
