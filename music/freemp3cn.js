const axios = require("axios");
function timeToSeconds(timeString) {
    // 将时间字符串分割为小时、分钟和秒（如果有的话）
    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {// 根据parts的长度决定如何计算
      return parts[0] * 3600 + parts[1] * 60 + parts[2];// 格式为 小时:分钟:秒
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];// 格式为 分钟:秒
    } else {// 无效格式
      return 0;
    }// 使用示例
    //console.log(timeToSeconds('4:29'));  // 输出：269
    //console.log(timeToSeconds('1:23:45'));  // 输出：5025
  }
async function fetchAndProcessData(query) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await axios.get(`https://api.freemp3cn.com/search?query=${encodedQuery}`);
      const items = response.data.items;
      // 存储搜索结果 
      const searchResults = [];
      items.forEach(item => {//console.log(item.channelTitle, item.id, item.title); duration
        const id = item.id;
        const title = item.title;// 音频名
        const artist = item.channelTitle;// 作者
        const artwork = "";// 专辑封面
        const duration = timeToSeconds(item.duration);
        const url = `https://api.freemp3cn.com/mp3/${id}.mp3`;// 音源
        const album = "FreeMp3Cn";// 专辑名，这里就随便写个了，不写也没事
        const lrc = "";
        searchResults.push({id,title,artist,artwork,album,url,lrc,duration})// 一定要有一个 id 字段
      });
        return {isEnd: false,data: searchResults}
    } catch (error) {
        return {data: [],isEnd: true}
    }
  }
module.exports = {
    platform: "FreeMp3Cn", // 插件名
    version: "0.0.1", // 版本号
    author: "Ri",
    srcUrl: "https://wwrichard.github.io/music/freemp3cn.js",
    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        if (type === "music") {
            return await fetchAndProcessData(query);
        }
    },
    async getMediaSource(musicItem, quality) {
            return {url: musicItem.url,};
    },
};
