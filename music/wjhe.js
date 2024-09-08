const axios = require("axios");
async function fetchAndProcessData(query,page) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await axios.get(`https://music.wjhe.top/api/music/kuwo/search?key=${encodedQuery}&pageIndex=${page}&pageSize=20`);
      const values = response.data;
      const items = values.data.data;
      // 存储搜索结果 
      const searchResults = [];
      items.forEach(item => {//console.log(item.channelTitle, item.id, item.title); duration
        //rawLrc?: string;/** 歌词文本（lrc格式 带时间戳） */
        const id = item.ID;
        const title = item.title;// 音频名
        const artist = item.singers[0].name;// 作者
        const artwork = "";// 专辑封面
        const duration = item.duration;
        let links = item.fileLinks;
        let quality = 320;
        let format = "mp3";
        links.forEach(link => {
          if(link.format === "mp3"){
            quality = link.quality;
            format = link.format;
          }
        });
        let musicUrl = `https://music.wjhe.top/api/music/kuwo/url?ID=${id}&quality=${quality}&format=${format}`;
        const url = musicUrl;// 音源
        const album = item.album.name;// 专辑名，这里就随便写个了，不写也没事
        const lrc = "";
        searchResults.push({id,title,artist,artwork,album,url,lrc,duration})// 一定要有一个 id 字段
      });
        return {isEnd: false,data: searchResults}
    } catch (error) {
        return {data: [],isEnd: true}
    }
  }
module.exports = {//https://hayqbhgr.slider.kz/#%E5%91%A8%E6%9D%B0%E4%BC%A6
    platform: "Wjhe", // 插件名
    version: "0.0.1", // 版本号
    author: "Ri",
    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        if (type === "music") {
            return await fetchAndProcessData(query,page);
        }
    },
    async getMediaSource(musicItem, quality) {
            return {url: musicItem.url,};
    },
};