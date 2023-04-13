<template>
<div class="video-preview-list">
    <!-- 如果列表为空，显示“暂无搜索记录”和放大镜图标 -->
    <div v-if="isSearching === true" class="searching">
        <i class="fa fa-spinner fa-pulse fa-3x"></i>
        <p>搜索中</p>
    </div>
    <div v-if="items.length === 0 && !isSearching" class="no-search-results">
        <i class="fa fa-search fa-5x"></i>
        <p>暂无搜索记录</p>
    </div>
    <div v-else class="video-preview" v-for="(page, index) in pages" :key="index">
    <template v-for="item in page">
    <div class="preview-item" v-if="index === currentPage - 1"  :key="item.id" @mouseenter="onMouseEnter(item)" @click="onMouseClick(item)">
        <div class="overlay-title">
            {{ item.title }}
        </div>
        <div v-if="currentHover === item" class="preview-video">
        <video controls v-on:loadedmetadata="onVideoLoaded(item)">
            <source :src="item.videoPath">
            不支持的视频类型
        </video>
        </div>
        <div v-else>
            <img :src="item.thumbnail" class="preview-video" id='previewImage'>
        </div>
    </div>
    </template>
    </div>

    <!-- 分页栏 -->
    <div class="page-navigation">
    <ul>
        <!-- 上一页 -->
        <li v-if="currentPage > 1" @click="prevPage"><i class="fa fa-angle-left"></i></li>

        <!-- 页码按钮 -->
        <li v-for="(page, index) in pageCount"
            :key="index"
            :class="{ 'current-page': currentPage === index + 1 }"
            @click="jumpToPage(index + 1)">
        {{ index + 1 }}
        </li>

        <!-- 下一页 -->
        <li v-if="currentPage < pageCount" @click="nextPage"><i class="fa fa-angle-right"></i></li>
    </ul>
    </div>

</div>
</template>
    
<style scoped>
.video-preview-list {
    margin-top: 3%;
    margin-bottom: 2%;
    margin-left: 10%;
    margin-right: 10%;
    border-radius: 10px;
    background-color: #e0e0e0;
    padding: 10px;
    position: relative;
}

.searching {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 70vh;
}

.searching i {
    color: #ccc;
    margin-bottom: 20px;
}

.searching p {
    font-size: 20px;
    color: #ccc;
}

.no-search-results {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 70vh;
}

.no-search-results i {
    color: #ccc;
    margin-bottom: 20px;
}

.no-search-results p {
    font-size: 20px;
    color: #ccc;
}

.video-preview {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-bottom: 2%;
    padding: 2%;
}

.preview-item {
    width: calc(30% - 10px);
    margin-right: 5px;
    margin-left: 5px;
    margin-top: 2px;
    margin-bottom: 3px;
    border: 3px solid #383838;
    background-color: rgb(132, 132, 132);
    border-radius: 5px;
    overflow: auto;
    position: relative;
}

.preview-video {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.preview-video video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-video img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(20, 20, 20, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
    opacity: 0;
    transition: opacity 0.2s;
}

.preview-overlay:hover {
    opacity: 0.9;
}

.overlay-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.overlay-title {
    color: #fff;
    font-size: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
}

.overlay-controls {
    width: 100%;
    margin-left: 100%;
    margin-right: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.play-pause {
    background-color: transparent;
    border: none;
    color: #ffffff;
    font-size: 20px;
    width: 10px;
    margin-right: 10px;
    cursor: pointer;
}

.fa-play:before {
    content: '\f04b';
}

.fa-pause:before {
    content: '\f04c';
}

.progress-bar {
    width: calc(15vw - 7vh);
    height: 10px;
    background-color: #181818;
    border-radius: 3px;
    overflow: hidden;
    margin-left: 20px;
}

.progress-bar-fill {
    height: 100%;
    background-color: rgb(255, 255, 255);
    transition: width 0.2s;
}

.page-navigation {
  position: relative;
  margin-top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.page-navigation ul {
  list-style: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-navigation li {
  margin: 0 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: #eee;
  color: #333;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}

.page-navigation li.current-page {
  background-color: #333;
  color: #fff;
}
</style>

<script>

export default {
    name: 'VideoPreviewList',
    props: {
        items: {
            type: Array,
            required: true,
        },
        isSearching: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            currentHover: null,
            pageSize: 9,
            currentPage: 1,
        };
    },
    computed: {
        pages() {
            const pageCount = Math.ceil(this.items.length / this.pageSize);
            const pages = [];
            for (let i = 0; i < pageCount; i++) {
                const start = i * this.pageSize;
                const end = start + this.pageSize;
                const page = this.items.slice(start, end);
                pages.push(page);
            }
            return pages;
        },
        pageCount() {
            return Math.ceil(this.items.length / this.pageSize); // 计算总页数
        },
    },
    methods: {
        onMouseEnter(item) {
            this.currentHover = item;
        },
        onMouseLeave() {
            this.currentHover = null;
        },
        onMouseClick(item) {
            this.currentHover = item;
        },
        onVideoLoaded(item) {
            // 获取当前视频的播放位置
            const currentTime = item.progress;
            const video = event.target;
            // 动态生成currentTime属性的值
            video.currentTime = `${currentTime}`;
        },
        prevPage() {
            this.currentPage--;
        },
        nextPage() {
            this.currentPage++;
        },
        jumpToPage(index) {
            this.currentPage = index;
        }
    },
};
</script>