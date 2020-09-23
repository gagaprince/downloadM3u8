import { TaskPool } from "../task/taskUtil";
import { DownloadTask } from "./DownloadTask";

const fse = require('fs-extra');
export class DownloadMoreThread {
    private downloadUrl: string; //目标地址
    private pool: TaskPool;
    private desFile: string; //目标地址

    public constructor(downloadUrl: string, threadCount: number, desFile: string) {
        this.downloadUrl = downloadUrl;
        this.desFile = desFile;
        this.pool = new TaskPool(threadCount);
        this.initTask();
    }

    private async initTask() {
        // 创建一个文件
        this.createFile();
        // 开始下载任务
        await this.beginTask();
        // 下载完毕后将文件名改写
        this.finish();
    }

    private createFile() {
        fse.ensureFileSync(this.desFile);
    }

    private async beginTask() {
        this.pool.addTask(new DownloadTask(this.downloadUrl, 0, 199, this.desFile));
        this.pool.addTask(new DownloadTask(this.downloadUrl, 200, 399, this.desFile));
        this.pool.addTask(new DownloadTask(this.downloadUrl, 400, 599, this.desFile));
        this.pool.addTask(new DownloadTask(this.downloadUrl, 600, 799, this.desFile));
        this.pool.addTask(new DownloadTask(this.downloadUrl, 800, 999, this.desFile));
        this.pool.addTask(new DownloadTask(this.downloadUrl, 1000, 1199, this.desFile));
    }
    private finish() { }
}