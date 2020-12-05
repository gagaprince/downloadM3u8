import {Anylyzer} from './spider';
import cheerio from 'cheerio';
export class TitleAnylyzer implements Anylyzer{
    anylyse(text:string){
        const $ = cheerio.load(text);
        const title = $('title').text().trim();
        return title;
    }
}
export class M3u8Anylyzer implements Anylyzer{
    anylyse(text:any){
        return text.data.url;
    }
}