export * from './spider';
export * from './papainfo';

import {Spider} from './spider';
import {TitleAnylyzer,M3u8Anylyzer} from './papainfo';

export interface Info {
    title:string;
    m3u8Url:string;
}

export const getInfo = async (id:string):Promise<Info>=>{
    const spider = new Spider(new TitleAnylyzer());
    const title = await spider.get(`http://papapa.info/vod/play/id/${id}/sid/1/nid/1.html`);
    console.log(title);
    const m3u8Sprider = new Spider(new M3u8Anylyzer());
    const m3u8Url = await m3u8Sprider.get(`http://papapa.info/vod/getPlayUrl?id=${id}&is_win=false`);
    console.log(m3u8Url);
    return {title,m3u8Url};
}

