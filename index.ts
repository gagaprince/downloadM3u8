// const fs = require('fs');
const path = require('path');
// console.log(process.cwd());
const tmpFile = path.resolve(process.cwd(), 'tmp');

import { DownloadMoreThread } from "./src/download/DownloadMoreThread";

// fs.open(tmpFile, 'w', (err: any, fd: any) => {
//     console.log(fd);
//     const buf = Buffer.alloc(4);
//     buf.writeInt32BE(100, 0);
//     console.log(buf);
//     fs.write(fd, buf, 0, 4, 2, (err1: any, written: number, buffer: Buffer) => {
//         console.log(err1);
//         console.log(written);
//         console.log(buffer);
//     });
// })

// const tmpBuf = fs.readFileSync(tmpFile);
// console.log(tmpBuf);
// console.log(tmpBuf.length);

// new DownloadMoreThread('', 4, tmpFile);

const test = async () => {
    console.log('test');
    const ret = await new Promise((res) => {
        setTimeout(() => {
            res('hhh');
        }, 1000);
    }).then((res) => {
        console.log(res);
        return 'www';
    });
    console.log(ret);
}

test();