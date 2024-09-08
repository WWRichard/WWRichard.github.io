const axios = require("axios");
const headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',}
function extractAudioData(data) {
  // 检查数据结构是否符合预期
  if (!data.audios || !data.audios['']) {
    console.error('Unexpected data structure');
    return [];
  }
  // 直接返回所有音频数据
  return data.audios[''];
}
function splitArtistAndTitle(input) {
  // 使用正则表达式分割字符串
  const parts = input.split(/\s*-\s*/);
  // 如果分割成功，返回去除空格后的两部分
  if (parts.length === 2) {
      return {
          artist: parts[0].trim(),
          title: parts[1].trim()
      };
  } 
  // 如果没有 "-"，假设整个字符串是标题
  return {
      artist: "",
      title: input.trim()
  };
}
async function fetchAndProcessData(query) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await axios.get(`https://hayqbhgr.slider.kz/vk_auth.php?q=${encodedQuery}`,{ headers });
      const values = response.data;
      const items = extractAudioData(values);
      // 存储搜索结果 
      const searchResults = [];
      items.forEach(item => {//console.log(item.channelTitle, item.id, item.title); duration
        //rawLrc?: string;/** 歌词文本（lrc格式 带时间戳） */
        const title_artis = splitArtistAndTitle(item.tit_art);
        const id = item.id;
        const title = title_artis.title;// 音频名
        const artist = title_artis.artist;// 作者
        const artwork = "";// 专辑封面
        const duration = item.duration;
        const url = item.url.includes('https://') ? item.url : `https://hayqbhgr.slider.kz/${item.url}`;// 音源
        const album = "Slider";// 专辑名，这里就随便写个了，不写也没事
        const lrc = "";
        searchResults.push({id,title,artist,artwork,album,url,lrc,duration})// 一定要有一个 id 字段
      });
        return {isEnd: false,data: searchResults}
    } catch (error) {
        return {data: [],isEnd: true}
    }
  }
module.exports = {//https://hayqbhgr.slider.kz/#%E5%91%A8%E6%9D%B0%E4%BC%A6
    platform: "Slider", // 插件名
    version: "0.0.1", // 版本号
    author: "Ri",
    srcUrl: "https://wwrichard.github.io/music/slider.js",
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
