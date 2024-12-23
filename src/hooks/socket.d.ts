export type Msg = { 
    type: string; 
    id: string; 
    msgId:string
    timestamp: number; 
    data?: string; 
    progress?: string; 
    loadMsg?: string ;
    fileBlob?:Blob
    fileName?:string
    fileSize?:number
}

