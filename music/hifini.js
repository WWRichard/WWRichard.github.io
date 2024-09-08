const axios = require("axios");
const qs = require("qs");


const headers = {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'};
async function getData(id) {
    const response = await axios.get(`https://www.hifini.com/${id}`, {headers:headers });
      //console.log(response.data);
      return response.data;
}
function base32Encode(str) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var base32 = "";

    for(var i = 0; i < str.length; i++) {
        var bit = str.charCodeAt(i).toString(2);
        while(bit.length < 8) {
            bit = "0" + bit;
        }
        bits += bit;
    }

    while(bits.length % 5 !== 0) {
        bits += "0";
    }

    for(var i = 0; i < bits.length; i += 5) {
        var chunk = bits.substring(i, i+5);
        base32 += base32chars[parseInt(chunk, 2)];
    }

    while(base32.length % 8 !== 0) {
        base32 += "=";
    }

    return base32.replace(/=/g, 'HiFiNiYINYUECICHANG');
}
function generateParam(data) {
    var key = '95wwwHiFiNicom27';
    var outText = '';

    for(var i = 0, j = 0; i < data.length; i++, j++) {
        if(j == key.length) j = 0;
        outText += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(j));
    }
    return base32Encode(outText);
}

async function extractMusicDataFromHTML(id) {
    // 使用正则表达式匹配music数组
    const data = await getData(id);
    //console.log(data);
    const musicRegex = /music:\s*\[([\s\S]*?)\]/;
    const match = data.match(musicRegex);
    //console.log(match);
    if (match && match[1]) {
        // 提取music数组的内容
        const musicContent = match[1];
        //console.log(musicContent);

        // 使用正则表达式匹配各个属性
        const titleMatch = musicContent.match(/title:\s*'([^']+)'/);
        const authorMatch = musicContent.match(/author:\s*'([^']+)'/);
        const urlMatch = musicContent.match(/url:\s*'([^']+)'/);
        const picMatch = musicContent.match(/pic:\s*'([^']+)'/);
        const seg      = musicContent.match(/generateParam\('([^']+)'\)/);
        const pStr     = generateParam(seg[1]);
        // 构造音乐对象
        const musicData = {
            title: titleMatch ? titleMatch[1] : '',
            author: authorMatch ? authorMatch[1] : '',
            url: urlMatch ? urlMatch[1] : '',
            pic: picMatch ? picMatch[1] : '',
            seg: seg ? seg[1] : '',
            pStr: pStr,
            trueUrl: "https://www.hifini.com/" + urlMatch[1] + pStr
        };
        //console.log(musicData);
        //const trueUrl = musicData.url + musicData.pStr;
        //console.log(trueUrl);
        return musicData;
    }
    return null; // 如果没有找到匹配的数据，返回null
}



function encodeChineseURL(input) {
    const encoded = encodeURIComponent(input);
    const halfLink = encoded.replace(/%/g, '_').toUpperCase();
    const url = `https://www.hifini.com/search-${halfLink}-1.htm`;
    return url;
  }
  // 使用示例
//   const searchTerm = "周杰伦";
//   const encodedTerm = encodeChineseURL(searchTerm);
//   console.log(encodedTerm);




function parseMusicList(html) {
    const regex = /<li class="media thread tap\s+(?!zun)"[\s\S]*?data-href="(thread-\d+)\.htm"[\s\S]*?<a href="thread-\d+\.htm"><em>(.*?)<\/em>(.*?)<\/a>/g;
    const results = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const threadId = match[1];  // Now this will be "thread-894" without ".htm"
      const artist = match[2].replace(/<\/?em>/g, '').trim();  // Remove nested <em> tags and trim
      let song = match[3].trim();
      // Extract song title from 《》
      const songMatch = song.match(/《(.*?)》/);
      if (songMatch) {
        song = songMatch[1];
      } else {
        // If no 《》, just use the first part of the string (before any brackets)
        song = song.split(/[\[(/]/)[0].trim();
      }
      results.push({ threadId, artist, song });
    }
    return results;
  }

//netease,1ting,ximalaya
module.exports = {
    platform: "hifini", // 插件名
    version: "0.0.1", // 版本号
    author: "Ri",
    srcUrl: "https://wwrichard.github.io/music/hifini.js",
    cacheControl: "no-store", // 我们可以直接解析出musicItem的结构，因此选取no-store就好了，当然也可以不写这个字段
    async search(query, page, type) {
        //const uu = encodeChineseURL(query)
        const sampleHTML = await axios.get(encodeChineseURL(query),{headers:headers })
        const musicList = parseMusicList(sampleHTML.data);
        // 存储搜索结果 
        const searchResults = [];
        for (let i = 0; i < musicList.length; i++) 
        //for (let i = 0; i < 2; i++) 
        {
            let item = musicList[i];
            const id = item.threadId;
            // 音频名
            const title = item.song;
            // 作者
            const artist = item.artist;
            // 专辑封面
            const artwork = "";//item.pic;
            // 音源
            const url = "";//item.url;
            // 专辑名，这里就随便写个了，不写也没事
            const album = "hifini";//item.type;
            const lrc = "";//item.lrc;
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
        };
        return {
            isEnd: false,
            data: searchResults
        }
    },
    async getMediaSource(musicItem, quality) {
        const song = await extractMusicDataFromHTML(musicItem.id+".htm")
        return {url: song.trueUrl,};
    },
};
