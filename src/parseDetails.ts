import { load } from "cheerio";

export function parseID(url: string): string | undefined {
    const obj = new URL(url);

    return obj.pathname.split("/")[2];
}

export interface GameDetails {
    title: string;
    type: "base" | "update" | "dlc";
    extension: "cia" | "nds";
    version: string;
    dl: string;
    id: string;
}

export async function parseDetails(
    id: string,
): Promise<GameDetails | undefined> {
    const url = `https://hshop.erista.me/t/${id}`;

    const data = await fetch(url).then((e) => e.text());

    const $ = load(data);

    const title = $(".green.bold.nospace").first().text();

    const typelink = $('a.green.bold.inline-link.underline[href^="/c/"]')
        .first()
        .text();

    let type: "base" | "update" | "dlc";

    let extension: "cia" | "nds" = "cia";

    if (typelink.toLowerCase().includes("games")) {
        type = "base";
    } else if (typelink.toLowerCase().includes("update")) {
        type = "update";
    } else {
        type = "dlc";
    }

    if(typelink.toLowerCase().includes("ds")) {
        type = "base";
        extension = "nds";
    }

    const version = $("span.red").first().text();

    const dl = $(".btn.btn-c3").first().attr("href");

    let isValueNull = false;

    [title, type, version, dl].forEach((v) => {
        if (!v) {
            isValueNull = true;
            return;
        }
    });

    if (isValueNull) return;

    return {
        title,
        type: type,
        version,
        dl: dl as any,
        id,
        extension
    };
}
