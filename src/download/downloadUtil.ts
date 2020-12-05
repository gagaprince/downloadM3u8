import axios from 'axios';
const fs = require('fs-extra');
const fsNode = require('fs');
const path = require('path');
import { AES } from '../aes/AES';
const ffmpeg = require('fluent-ffmpeg');
const { execSync } = require('child_process');

interface TsObject {
    url: string;
    index: number;
    filePath?: string;
}

export const downloadByUrl = async (
    url: string,
    filePath: string,
    name: string
) => {
    fs.ensureDirSync(filePath);
    const mypath = path.resolve(filePath, name);
    if (fsNode.existsSync(mypath) && fs.statSync(mypath).size != 0) {
        return 'continue';
    }
    const writer = fs.createWriteStream(mypath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });
    const inputStream = response.data;
    const length = response.headers['content-length'] || 1;
    const fileBig = length / 1024 / 1024;
    console.log(`${name}文件长度:${fileBig}M`);

    // let currentFileLength = 0;
    // inputStream.on('data', (data: any) => {
    //     console.log('文件传输中...');
    //     currentFileLength += data.length;
    //     console.log(
    //         `当前文件长度：${currentFileLength / 1024 / 1024}M/${fileBig}M`
    //     );
    //     const percent = Math.floor((currentFileLength / length) * 100);
    //     console.log(`进度：${percent}%`);
    // });
    inputStream.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', (data: any) => {
            console.log(`${name}下载完毕....`);
            resolve(data);
        });
        writer.on('error', (e: any) => {
            console.log(e);
            fs.removeSync(mypath);
            reject(e);
        });
    });
};

export const downloadM3u8File = async (m3u8Url: string, name: string) => {
    const m3u8Path = path.resolve(getDefaultPath(), name);
    await downloadByUrl(m3u8Url, m3u8Path, 'tmp.m3u8');
    return path.resolve(m3u8Path, 'tmp.m3u8');
};
export const downloadM3u8KeyFile = async (m3u8KeyUrl: string, name: string) => {
    const m3u8Path = path.resolve(getDefaultPath(), name);
    await downloadByUrl(m3u8KeyUrl, m3u8Path, 'tmp.key');
    return path.resolve(m3u8Path, 'tmp.key');
};

export const transformTsToMp4 = (
    depath: string,
    depathMp4: string,
    key: string,
    iv: string
) => {
    const aes = new AES(key, iv);
    let buff = fs.readFileSync(depath);
    let deHex = aes.aesDecryptNew(buff);
    fs.writeFileSync(depath, new Buffer(deHex, 'hex'));
    return new Promise((res, rej) => {
        new ffmpeg(depath)
            .save(depathMp4)
            .on('progress', function (progress: any) {
                console.log('Processing: ' + progress.percent + '% done');
            })
            .on('end', () => {
                setTimeout(() => {
                    fs.removeSync(depath);
                });
                res(depathMp4);
            })
            .on('error', (e: any) => {
                rej(e);
            });
    });
};

export const downloadM3u8TsFiles = async (
    m3u8TsUrls: TsObject[],
    baseUrl: string,
    name: string,
    key: string,
    iv: string
): Promise<TsObject[]> => {
    const m3u8Path = path.resolve(getDefaultPath(), name);
    const filePaths: TsObject[] = [];
    for (let i = 0; i < m3u8TsUrls.length; i++) {
        const m3u8TsUrl = `${baseUrl}${m3u8TsUrls[i].url}`;
        const url = new URL(m3u8TsUrl);
        const fileName = url.pathname
            .substring(url.pathname.lastIndexOf('/') + 1)
            .split('?')[0];
        const filePath = path.resolve(m3u8Path, fileName);
        m3u8TsUrls[i].filePath = filePath;
        try {
            const coti = await downloadByUrl(m3u8TsUrl, m3u8Path, fileName);
            // if (coti !== 'continue') {
            //     await transformTsToMp4(
            //         filePath,
            //         filePath.replace('.ts', '.mp4'),
            //         key,
            //         iv
            //     );
            // }
        } catch (e) {
            i--;
            console.log(e);
            console.log(`${m3u8TsUrl} 下载失败，重新下载......`);
            fs.removeSync(filePath);
            // fs.removeSync(filePath.replace('.ts', '.mp4'));
            continue;
        }

        filePaths.push(m3u8TsUrls[i]);
    }
    return filePaths;
};

export const downloadSplitM3u8Files = async (
    m3u8TsUrls: TsObject[],
    baseUrl: string,
    name: string,
    key: string,
    iv: string
): Promise<TsObject[]> => {
    const splitUrls = sliceArray(
        m3u8TsUrls,
        Math.floor(m3u8TsUrls.length / 50)
    );
    const promises: Promise<TsObject[]>[] = [];
    splitUrls.forEach((urls, index) => {
        // if (index == 0) {
        promises.push(downloadM3u8TsFiles(urls, baseUrl, name, key, iv));
        // }
    });
    const splitFilePaths: TsObject[][] = await Promise.all(promises);
    const filePaths = splitFilePaths.reduce((pre: TsObject[], current) => {
        return pre.concat(current);
    }, []);
    return filePaths;
};

export const connectFile = (
    files: TsObject[],
    name: string,
    key: string,
    iv: string
) => {
    const tmpDir = path.resolve(getDefaultPath(), name);
    const depathMp4 = path.resolve(getDefaultPath(), `${name}.ts`);
    fs.ensureFileSync(depathMp4);
    if (key && iv) {
        const aes = new AES(key, iv);
        for (let i = 0; i < files.length; i++) {
            try {
                const spath = files[i].filePath;
                console.log(spath);
                let buff = fs.readFileSync(spath);
                let deHex = aes.aesDecryptNew(buff);
                fs.writeFileSync(depathMp4, new Buffer(deHex, 'hex'), {
                    flag: 'a',
                });
            } catch (e) {
                continue;
            }
        }
    } else if (key) {
        //没有iv的情况
        for (let i = 0; i < files.length; i++) {
            const index = files[i].index;
            let buffer = Buffer.alloc(16);
            buffer.writeUInt32BE(index, 12); //write the high order bits (shifted over)
            iv = buffer.toString('hex');
            console.log(iv);
            const aes = new AES(key, iv);
            try {
                const spath = files[i].filePath;
                console.log(spath);
                let buff = fs.readFileSync(spath);
                let deHex = aes.aesDecryptNew(buff);
                fs.writeFileSync(depathMp4, new Buffer(deHex, 'hex'), {
                    flag: 'a',
                });
            } catch (e) {
                continue;
            }
        }
    } else {
        for (let i = 0; i < files.length; i++) {
            try {
                const spath = files[i].filePath;
                console.log(spath);
                let buff = fs.readFileSync(spath);
                fs.writeFileSync(depathMp4, buff, {
                    flag: 'a',
                });
            } catch (e) {
                continue;
            }
        }
    }
    fs.removeSync(tmpDir);

    try {
        execSync(
            `ffmpeg -i '${depathMp4}' -acodec copy -vcodec copy -f mp4 '${depathMp4.replace(
                '.ts',
                '.mp4'
            )}'`
        );
        fs.removeSync(depathMp4);
    } catch (e) {
        console.log(e);
    }
    // ffmpeg(depath)
    //     .save(depathMp4)
    //     .on('progress', function (progress: any) {
    //         console.log('Processing: ' + progress.percent + '% done');
    //     })
    //     .on('end', () => {
    //         fs.removeSync(depath);
    //     });
};

export const downloadM3u8FileToMp4 = async (m3u8Url: string, name: string) => {
    const m3u8File = await downloadM3u8File(m3u8Url, name);
    console.log(m3u8File);
    const m3u8FileContent = fs.readFileSync(m3u8File, 'utf8');
    console.log(m3u8FileContent);
    const keyUrl = getKeyFromContent(m3u8FileContent);
    let key = '';
    const urlBase = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
    if (keyUrl) {
        console.log(urlBase);
        console.log(keyUrl);
        const keyFile = await downloadM3u8KeyFile(`${urlBase}${keyUrl}`, name);
        console.log(keyFile);
        key = fs.readFileSync(keyFile, 'hex');
        console.log(key);
    }

    const iv = getIvFromContent(m3u8FileContent);
    console.log(iv);

    const tsUrls = getTsUrls(m3u8FileContent);
    // console.log(tsUrls);
    // console.log(tsUrls.length);
    const tsObjects: TsObject[] = tsUrls.map((tsUrl, index) => {
        return { url: tsUrl, index };
    });

    const mp4Files: TsObject[] = await downloadSplitM3u8Files(
        tsObjects,
        urlBase,
        name,
        key,
        iv
    );
    console.log(mp4Files);
    connectFile(mp4Files, name, key, iv);
};

export const getKeyFromContent = (m3u8FileContent: string) => {
    const lines = m3u8FileContent.split('\n');
    console.log(lines.length);
    const line = lines.find((line) => {
        if (line.indexOf('EXT-X-KEY') != -1) return true;
    });
    const keys = line?.split(',') || '';
    try {
        return keys[1].split('=')[1].replace('"', '').replace('"', '');
    } catch (e) {
        return '';
    }
};

export const getIvFromContent = (m3u8FileContent: string) => {
    const lines = m3u8FileContent.split('\n');
    console.log(lines.length);
    const line = lines.find((line) => {
        if (line.indexOf('EXT-X-KEY') != -1) return true;
    });
    const keys = line?.split(',') || '';
    try {
        return keys[2].split('=')[1].substring(2);
    } catch (e) {
        return '';
    }
};

export const getTsUrls = (m3u8FileContent: string) => {
    const lines = m3u8FileContent.split('\n');
    console.log(lines.length);
    const urls = lines.filter((line) => {
        return line != '' && line.indexOf('EXT') == -1;
    });
    return urls;
};

function sliceArray(array: TsObject[], size: number) {
    var result = [];
    if (size == 0) {
        size = 1;
    }
    for (var x = 0; x < Math.ceil(array.length / size); x++) {
        var start = x * size;
        var end = start + size;
        // console.log(start + ':' + end);
        result.push(array.slice(start, end));
    }
    return result;
}

const getDefaultPath = () => {
    return path.resolve(process.cwd(), '..','m3u8tmp');
};
