import { Task } from "../task/taskUtil";

export class DownloadTask extends Task {

    public constructor(private downloadUrl: string, private start: number, private end: number, private desFile: string) {
        super();

    }

    task(): void | Promise<any> {
        return new Promise((res) => {
            setTimeout(() => {
                console.log(this.start);
                res();
            }, 1000);
        })
    }
}