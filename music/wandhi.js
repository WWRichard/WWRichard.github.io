const axios = require("axios");
const qs = require("qs");

async function getCurrentPlatform() {
    let platform = 'netease';
    const platformUrl = "https://WWRichard.github.io/music/from_platform.html";
    try {
        const response = await axios.get(platformUrl);
        let data = response.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (parseError) {
                //console.error("解析错误:", parseError);
                return platform;
            }
        }
        if (typeof data === 'object' && data !== null) {
            const currentPlatformIndex = parseInt(data.current_platform) - 1;
            if (data.all_platforms && data.all_platforms[currentPlatformIndex]) {
                return data.all_platforms[currentPlatformIndex];
            }
        }
    } catch (error) {
        //console.error("请求错误:", error);
    }
    return platform;
}
//netease,1ting,ximalaya
module.exports = {
    platform: "玩得嗨", // 插件名
    version: "0.0.1", // 版本号
    author: "Ri",

    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        let platformIn = await getCurrentPlatform();
        if (type === "music") {
            const referer = `https://music.wandhi.com/?name=${encodeURIComponent(query)}&type=${platformIn}`;  // 动态构造 referer URL
            const headers = {
                'referer': referer,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
            };
            const data = {
                'input': query,
                'filter': 'name',
                'type': platformIn,
                'page': page,
            };
            // 存储搜索结果 
            const searchResults = [];
            await axios.post('https://music.wandhi.com/', qs.stringify(data), { headers })
                .then(response => {
                    const datas = response.data.data;  // 处理返回的 JSON 数据
                    datas.forEach(item => {
                        const id = item.songid;
                        // 音频名
                        const title = item.title;
                        // 作者
                        const artist = item.author;
                        // 专辑封面
                        const artwork = item.pic;
                        // 音源
                        const url = item.url;
                        // 专辑名，这里就随便写个了，不写也没事
                        const album = item.type;
                        const lrc = item.lrc;
                        searchResults.push({
                            // 一定要有一个 id 字段
                            id,
                            title,
                            artist,
                            artwork,
                            album,
                            url,
                            lrc
                        })
                    });
                })
                .catch(error => {
                    return {
                        data: [],
                        isEnd: true
                    }
                    //console.error(error);
                });
            return {
                isEnd: false,
                data: searchResults
            }
        }
    },
    async getMediaSource(musicItem, quality) {
            return {url: musicItem.url,};
    },
};