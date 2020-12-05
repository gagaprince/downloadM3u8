import { downloadByUrl, downloadM3u8FileToMp4 } from './download/index';
const path = require('path');
const fs = require('fs');
import { AES } from './aes/AES';
const ffmpeg = require('fluent-ffmpeg');
import {getInfo} from './spider';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


const downloadById = async(id:string)=>{
    const downloadInfo = await getInfo(id);
    console.log(downloadInfo);
    await downloadM3u8FileToMp4(downloadInfo.m3u8Url,downloadInfo.title);
}


async function main() {
    const start = Date.now();

    const ids:string[] = ['125621','125328','125566','125690'];
    for(let i=0;i<ids.length;i++){
        const id = ids[i];
        await downloadById(id);
    }

    
    // await downloadM3u8FileToMp4(
    //     'https://vs02.520call.me/files/mp4/U/UD9dh.m3u8?t=1605432229',
    //     'HUNTA-824 搞錯女友上了她的雙胞胎妹妹（超認真純樸）自後方馬上無套抽插中出後…！[有碼高清中文字幕]'
    // );
    // await downloadM3u8FileToMp4(
    //     'https://vs02.520call.me/files/mp4/y/y0NJj.m3u8?t=1605432531',
    //     'KIR-014 太太的妹妹從鄉下來到東京、而且、妻子剛好回老家…真宮彩[有碼高清中文字幕]'
    // );
    // await downloadM3u8FileToMp4(
    //     'http://video3.papapa.info/video/complete/s_dvj_drX1U_a9WKDI6KIfqw_s/t_1605439932_t/p_11_p/2020/11/15/184211/index.m3u8',
    //     '[GVG-230] 禁断看护 坂口丽奈[中文字幕]'
    // );
    
    
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
