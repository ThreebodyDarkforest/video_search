<template>
  <div>
    <searchBox @search-result="handleSearch" @search="searching" @failed="searched"></searchBox>
  </div>
  <div>
    <videoList :items="videoItems" :isSearching="isSearching"></videoList>
  </div>
</template>

<script>
import searchBox from './components/searchBox.vue'
import videoPreviewList from './components/videoPreviewList.vue';
import { getVideo } from './components/utils.js';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    'searchBox': searchBox,
    'videoList': videoPreviewList,
  },
  methods: {
    async getSid() {
      try {
        const response = await axios.get(process.env.VUE_APP_BACKEND_URL + '/video/login/', {
          headers: {
            'Authorization': 'Token ' + process.env.VUE_APP_TOKEN.trim(),
            'Content-Type': 'application/json',
          }
        })
        this.sid = response.data.data.sid;
      } catch (error) {
        console.log(error)
      }
    },
    searching() {
      this.videoItems = [];
      this.isSearching = true;
    },
    searched() {
      this.isSearching = false;
    },
    async handleSearch(searchResult) {
      const videoitems = [];
      if (this.cancelFetchPreview) {
        this.cancelFetchPreview.forEach(cancel => cancel());
        this.cancelFetchPreview = null;
      }
      try {
        // 使用Promise.all()方法等待所有异步操作完成
        const promises = searchResult.result.map((item, i) => {
          return getVideo(this.sid, item).then(res => {
            return {
              id: i,
              title: item.name.replace(/\.[^.]+$/g, ''),
              path: item.path,
              videoPath: res.videoURL,
              progress: item.sec,
              score: item.score,
              thumbnail: res.thumbURL,
            };
          });
        });
        
        const results = await Promise.all(promises); // 等待所有异步操作完成
        videoitems.push(...results); // 将结果添加到videoitems数组中
        this.videoItems = videoitems;
        this.isSearching = false;
        console.log(this.videoItems);

        // 异步获取真实封面
        // 在 handleSearch 方法中
        const cancelTokens = [];
        const af_promises = searchResult.result.map((item, i) => {
          const source = axios.CancelToken.source();
          cancelTokens.push(source.cancel);

          return getVideo(this.sid, item, true, source.token).then(res => {
            this.videoItems[i].thumbnail = res.thumbURL;
          });
        });

        this.cancelFetchPreview = cancelTokens;
        await Promise.all(af_promises);
      } catch (error) {
        console.error(error);
      }
    },
  },
  data() {
    return {
      sid: this.getSid(),
      videoItems: [],
      isSearching: false,
      cancelFetchPreview: null,
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
