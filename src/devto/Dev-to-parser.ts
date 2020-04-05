import { Article } from "../@types/Article";
import { load } from "cheerio"
import { capitalize } from "../helpers/String";

export async function parse(html: string, url:string): Promise<Array<Article>> {
    const results: Article[] = [];
    const $ = load(html);
    $("a.index-article-link").each((_, elem) => {
        elem.children.forEach(child => {
            const h3 = child.children?.filter(c_child => c_child.tagName === "h3").pop();
            if (h3) {
                const title = h3.children[0].data?.replace(/\n/g, "").trim();
                results.push({
                    url: url + elem.attribs.href,
                    title: title !== '' ? title : extractTitleFromUrl(elem.attribs.href),
                    source: 'dev.to'
                });
            }
        });
    });

    return results;
}

/*
* We get this as input /domenicosolazzo/i-got-the-job-3-tips-on-how-you-can-get-your-dream-job-4dl2
* and need to transform it to i got the job 3 tips on how you can get your dream job
*/
function extractTitleFromUrl(url: string) {
    const regex : RegExp = /^\/.+\/((\w|\d)+-){2,}/;
    if (regex.test(url)) {
        let res = url.split('/')[2].split('-');
        res.pop(); // last id part
        res[0] = capitalize(res[0]);
        return res.join(" ");
    } 
    return '';
}
