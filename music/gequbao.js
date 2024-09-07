const axios = require("axios");
const cheerio = require('cheerio');
const searchHeaders = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.61"
};
module.exports = {
    platform: "歌曲宝", // 插件名
    version: "0.0.1", // 版本号
    author: "Ri",

    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        if (type === "music") {
            // 我们能搜索的只有音乐，因此判断下类型
            const rawHtml = (
                await axios.get("https://www.gequbao.com/s/"+ encodeURIComponent(query), {
                    //q: query,
                    //page,
                    headers: searchHeaders,
                })
            ).data;
            // 接下来解析html 
            const $ = cheerio.load(rawHtml);
            // 存储搜索结果 
            const searchResults = [];
            // 获取所有的结果
            const resultElements = $('.row').slice(1, -1);
            // 解析每一个结果
            resultElements.each((index, row) => {
                // id
                const id = $(row).find('.music-link').attr('href').split('/').pop();
                // 音频名
                const title = $(row).find('.text-primary span').text().trim();
                // 作者
                const artist = $(row).find('.text-jade').text().trim();
                // 专辑封面
                const artwork = "";//playerElement.data('waveform');
                // 音源
                const url = "";
                // 专辑名，这里就随便写个了，不写也没事
                const album = '歌曲宝';
                searchResults.push({
                    // 一定要有一个 id 字段
                    id,
                    title,
                    artist,
                    artwork,
                    album,
                    url
                })
            });
            return {
                isEnd: true,
                data: searchResults
            }
        }
    },
    async getMediaSource(musicItem, quality) {
        const musicUrl = `https://www.gequbao.com/api/play_url?id=${musicItem.id}&json=1`;
        const res = await axios.get(musicUrl, { searchHeaders });
        if(res && res.data){
            return {url: res.data.data.url,};
        }
        return null;
    },
};