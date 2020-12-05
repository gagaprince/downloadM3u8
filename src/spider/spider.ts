import axios, {AxiosRequestConfig} from 'axios';
export interface Anylyzer {
    anylyse: (html: string) => any;
}
interface IHeaders {
    [propName: string]: string;
}

export class Spider{
    constructor(private anylyzer: Anylyzer | null) {}
    async get(url: string, headers?: IHeaders) {
        const axiosParams:AxiosRequestConfig = {
            url,
            method: 'GET',
        }
        if (headers) {
            axiosParams.headers=headers;
        }
        const result = await axios(axiosParams);
        return (
            (this.anylyzer &&
                this.anylyzer.anylyse((result && result.data) || '')) ||
            (result && result.data)
        );
    }
}