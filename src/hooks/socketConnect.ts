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
                peerMap.set(item, new Peer({ initiator: true, trickle: false ,}))
                peerMap.get(item)!.on('signal', (signal) => {
                    socket.emit('one-user-join-room', { newSocketId: id, signal, oldSocketId: item });
                })
                peerMap.get(item)!.on('data', (data) => {
                    // console.log(data.toString());
                    getData(data.toString(),receivedMessage)
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
            // console.log(data.toString());
            getData(data.toString(),receivedMessage)
            // receivedMessage.value.push({ id: newSocketId, data: data.toString(),type:'text' ,timestamp:new Date().getTime()})
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
const fileMap = new Map<string, any>()
const getData = (str: string,receivedMessage: Ref<Msg[]>)=>{
    try{
        const json = JSON.parse(str) as Msg
        if(json.type.startsWith("file")){
            if(json.type.startsWith("file-start")){
                const msg = {
                    type:json.type,
                    id:json.id,
                    loadMsg:json.loadMsg,
                    msgId:json.msgId,
                    timestamp:json.timestamp,
                    progress:"0",
                    fileSize:json.fileSize
                }
                // const { stream, controller } = createFileStream(json.msgId);
                fileMap.set(json.msgId, []);
                receivedMessage.value.push(msg)
            }else if(json.type.startsWith("file-progress")){
                //@ts-ignore fileBlob此时是ArrayBuffer的切片数据
                fileMap.get(json.msgId)!.push(new Uint8Array(json.fileBlob as Array<any>))
                const msg = receivedMessage.value.find(item=>item.msgId == json.msgId)!
                msg.progress = json.progress
                msg.loadMsg = '正在下载文件'
                msg.type = json.type
            }else if(json.type.startsWith("file-end")){
                const fileBlob = new Blob(fileMap.get(json.msgId)!)
                const msg = receivedMessage.value.find(item=>item.msgId == json.msgId)!
                msg.loadMsg = '文件下载完成'
                msg.fileBlob = fileBlob
                msg.fileName = json.fileName
                msg.type = json.type
                // const a = document.createElement('a');
                // const url = URL.createObjectURL(fileBlob);
                // a.href = url;
                // a.download = msg.fileName!;
                // a.click();
                // URL.revokeObjectURL(url);
            }
        }else if(json.type == "text"){
            receivedMessage.value.push(json)
        }
    }catch(e){
        console.log(e);
    }


}

