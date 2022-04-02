<template>
  <div class="main">
    <div ref="videoBox">
    </div>
    <img ref="short">
    <div class="button-box">
      <input type="text" v-model="url">
      <button @click="play">播放</button>
      <button @click="distroyPlayer">销毁</button>
      <button @click="getInfo">获取视频信息</button>
      <button @click="screenShort">截屏</button>
    </div>
  </div>
</template>

<script>
import RtspPlayer from '@/service/RtspPlayer'
export default {
  name: "HelloWorld",
  data() {
    return {
      url:'rtsp://admin:Admin123@112.4.169.122:554/Stream/Channels/101'
    };
  },
  mounted() {
    this.rtspPlayer = new RtspPlayer(this.$refs.videoBox)
  },
  methods: {
    getInfo() {
      this.rtspPlayer.getInfo(this.url).then((info)=>{
        console.log('info',info)
      })
    },
    play() {
      this.rtspPlayer.play(this.url)
    },
    screenShort(){
      this.rtspPlayer.screenShort(this.url).then((short)=>{
        this.$refs.short.src = short
      })
    },
    distroyPlayer() {
      this.rtspPlayer.distroy()
    },
  },
};
</script>

<style scoped>
</style>
