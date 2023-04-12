<template>
    <div>
      <input type="text" v-model="keyword" placeholder="请输入视频关键字">
      <button @click="search">搜索</button>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'searchBox',
    data() {
        return {
            keyword: '',
        };
    },
    methods: {
        search() {
            this.$emit('search');
            axios.post(process.env.VUE_APP_BACKEND_URL + '/video/search/', { 
                text: this.keyword, 
                search_type: 'precise'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + process.env.VUE_APP_TOKEN.trim()
                }
            }
            )
            .then(response => {
                // 将搜索结果传递给父组件
                this.$emit('search-result', response.data);
            })
            .catch(error => {
                this.$emit('failed');
                console.log(process.env);
                console.log(error);
            });
        },
    },
};
</script>

<style scoped>
/* 可以添加SearchBox.vue组件的样式 */
input[type="text"] {
    border: 1px solid #000;
    padding: 8px;
    font-size: 16px;
    width: 80%;
    margin-right: 10px;
    border-radius: 5px;
}

button {
    border-radius: 5px;
    background-color: #000;
    color: #fff;
    border: none;
    padding: 8px;
    font-size: 16px;
    cursor: pointer;
}
</style>