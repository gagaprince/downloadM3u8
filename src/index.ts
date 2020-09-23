import { downloadByUrl, downloadM3u8FileToMp4 } from './download/index';
const path = require('path');
const fs = require('fs');
import { AES } from './aes/AES';
const ffmpeg = require('fluent-ffmpeg');

async function main() {
    const start = Date.now();
    await downloadM3u8FileToMp4(
        'http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8', 'cctv'
    );
    const end = Date.now();
    console.log(Math.floor((end - start) / 100 / 60) / 10);
}
main();

// const aes = new AES(
//     'daf564f6e025df14f76bf8d916745cb0',
//     '3362b3705e513e49c715aa26aa98f246'
// );
// const depath = '/Users/gagaprince/work/wzdwork/downloadM3u8/tmp/test.ts';
// for (let i = 1; i < 10; i++) {
//     const spath = `/Users/gagaprince/work/wzdwork/downloadM3u8/tmp/(HD) SABA-558 超可愛的年輕女孩子 強迫口交 體液 中出[有碼高清中文字幕]/DOKsx000${i}.ts`;
//     console.log(spath);
//     let buff = fs.readFileSync(spath);
//     let deHex = aes.aesDecryptNew(buff);
//     fs.writeFileSync(depath, new Buffer(deHex, 'hex'), { flag: 'a' });
// }

// ffmpeg(depath).save(
//     '/Users/gagaprince/work/wzdwork/downloadM3u8/tmp/(HD) SABA-499 未來的女主播 對校花下春藥SEX 還用電話叫來朋友、也對朋友下藥SEX 3[有碼高清中文字幕]/test.mp4'
// );
