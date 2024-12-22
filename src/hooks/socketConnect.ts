import { io } from "socket.io-client";
import Peer from 'simple-peer';
import { Ref } from "vue";
import { Msg } from "./socket";

export default function (onlienUser:Ref<string[]>,myId:Ref<string>,receivedMessage:Ref<Msg[]>,peerMap:Map<string, Peer.Instance>): void {
    const socket = io("http://127.0.0.1:5001"); // WebSocket 服务器地址
    // const myId = ref(''); // 本地用户的 Socket ID
    // let peerMap: Map<string, Peer.Instance> = new Map()
    // const onlienUser = ref([]) as Ref<string[]>
    // 接收服务器分配的 ID
    socket.on('me', ({ id, userList }: { id: string, userList: string[] }) => {
        myId.value = id;
        console.log(userList);
        onlienUser.value = userList
        //对新的用户创建对所有旧的用户的发起器
        userList?.forEach(item => {
            console.log(peerMap);
            if (id != item) {
                peerMap.set(item, new Peer({ initiator: true, trickle: false }))
                peerMap.get(item)!.on('signal', (signal) => {
                    socket.emit('one-user-join-room', { newSocketId: id, signal, oldSocketId: item });
                })
                peerMap.get(item)!.on('data', (data) => {
                    console.log(data);
                    receivedMessage.value.push({ id: item, data: data.toString(),type:'text' ,timestamp:new Date().getTime()})
                })
                peerMap.get(item)!.on("connect", () => {
                    console.log("new connect");
                })
            }
        })
        console.log('My ID:', myId.value);
    });

    socket.on('one-user-joined', ({ signal, newSocketId, oldSocketId }) => {
        if (oldSocketId != myId.value) return
        const peer = new Peer({ initiator: false, trickle: false })
        peer.on('signal', (signal) => {
            socket.emit('give-new-user-signal', { newSocketId, signal, oldSocketId: myId.value });
        })
        peer.on("connect", () => {
            console.log("old connected");
            onlienUser.value.push(newSocketId)
        })
        peer.on('data', (data) => {
            console.log(data);
            receivedMessage.value.push({ id: newSocketId, data: data.toString(),type:'text' ,timestamp:new Date().getTime()})
        })
        peer.signal(signal)
        peerMap.set(newSocketId, peer)
    })

    socket.on('get-old-user-signal', ({ signal, oldSocketId }) => {
        console.log(signal, oldSocketId);
        peerMap.get(oldSocketId)!.signal(signal)
    })

    socket.on('user-leave', ({ id }) => {
        console.log(id + "死了");
        peerMap.get(id)!.destroy()
        peerMap.delete(id)
        onlienUser.value = onlienUser.value.filter(item => item != id)
    })

}