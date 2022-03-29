const {EventEmitter} = require('events')
const { spawn } = require('child_process');
const path = require('path')
const isDevelopment = process.env.NODE_ENV !== 'production'

export default class RtspPlayer extends EventEmitter{
    constructor(container){
        super()
        this.container = container
        this.canvas = document.createElement('canvas')
        this.canvas.style.width = '100%'
        this.canvas.style.height = '100%'
        this.canvasCtx = this.canvas.getContext('2d')

        container.appendChild(this.canvas)

        this.ffmpegPath = isDevelopment?__static+'/ffmpeg-4.4/bin/ffmpeg.exe':path.resolve(__static,'../../lib/ffmpeg-4.4/bin/ffmpeg.exe')
        this.ffprobePath = isDevelopment?__static+'/ffmpeg-4.4/bin/ffprobe.exe':path.resolve(__static,'../../lib/ffmpeg-4.4/bin/ffprobe.exe')
    }

    /**
     * 获取rtsp视频流信息
     * @param {string} url rtsp 地址
     * @returns 
     */
    getInfo(url){
        return new Promise((resolve,reject)=>{
            this.ffprobeProc = spawn(this.ffprobePath, `-rtsp_transport tcp -show_streams ${url}`.split(' '))
            let streamInfo = Buffer.alloc(0)

            this.ffprobeProc.stdout.on('data',(data) => {
                streamInfo = Buffer.concat([streamInfo,data])
            })
            this.ffprobeProc.stdout.on('end',() => {
                const text = streamInfo.toString('utf8')
                const matches = text.matchAll(/(?<key>.*)=(?<value>.*)/g)
                const r = new Map()
                for (const match of matches) {
                    r.set(match.groups.key,match.groups.value)
                }
                resolve(r)
            })
        })
    }
    
    async play(url){
        const info = await this.getInfo(url)
        this.canvas.width = info.get('width')
        this.canvas.height = info.get('height')
        const perFrameSize = 4 * this.canvas.width * this.canvas.height
        let dataFromRtsp = Buffer.alloc(0);
        
        if(this.ffmpegProc && !this.ffmpegProc.killed){
            this.ffmpegProc.kill()
        }
        const commandStr = `-rtsp_transport tcp -threads 0 -y -re -stream_loop 0 -i ${url} -an -r 5 -s ${this.canvas.width}x${this.canvas.height} -pix_fmt rgba -qscale:v 0.01 -f rawvideo -`
        console.log(commandStr)
        this.ffmpegProc = spawn(this.ffmpegPath, commandStr.split(' '))

        this.ffmpegProc.stdout.on('data',async (data)=>{
            dataFromRtsp = Buffer.concat([dataFromRtsp,data])
            if(dataFromRtsp.length >= perFrameSize){
                this.frameData = {
                    width:this.canvas.width,
                    height:this.canvas.height,
                    data: new Uint8ClampedArray(dataFromRtsp.slice(0,perFrameSize)) }
                
                dataFromRtsp = dataFromRtsp.slice(perFrameSize)
                this.draw()

                // this.emit('frame',this.frameData.data)
            }
        })
        this.ffmpegProc.stdout.on('close', () => {
            console.log('on stdout close')
        })
        this.ffmpegProc.stdout.on('end', () => {
            console.log('on stdout end')
        })
        this.ffmpegProc.stdout.on('error', () => {
            console.log('on stdout error')
            this.ffmpegProc.kill()
        })
        this.ffmpegProc.stdout.on('pause', () => {
            console.log('on stdout pause')
        })
        this.ffmpegProc.stdout.on('resume', () => {
            console.log('on stdout resume')
        })

    }

    draw(){
        const frame = new ImageData(
            Uint8ClampedArray.from(this.frameData.data),
            this.canvas.width,
            this.canvas.height
        );
        this.canvasCtx.putImageData(frame, 0, 0);
    }

    distroy(){
        this.ffmpegProc.kill()
    }
}