import { load } from "cheerio";
import pc from "picocolors";

function parseID(url: string): string | undefined {
  const obj = new URL(url);

  return obj.pathname.split("/")[2];
}

interface GameDetails {
  title: string;
  type: "game" | "update" | "dlc";
  version: string;
  dl: string;
  id: string;
}

async function parseDetails(id: string): Promise<GameDetails | undefined> {
  const url = `https://hshop.erista.me/t/${id}`;

  const data = await fetch(url).then((e) => e.text());

  const $ = load(data);

  const title = $(".green.bold.nospace").first().text();

  const typelink = $('a.green.bold.inline-link.underline[href^="/c/"]')
    .first()
    .text();

  let type : "game" | "update" | "dlc";

  if(typelink.toLowerCase().includes("games")) {
    type = "game"
  } else if(typelink.toLowerCase().includes("update")) {
    type = "update";
  } else {
    type = "dlc";
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
    id
  };
}

function fileNameFactory(details: GameDetails) {
  let values = [];

  values.push(details.title);

  if (details.type == "game") {
    values.push("Base");
  } else if (details.type == "update") {
    values.push("Update");
    values.push(details.version.split(" ")[0]);
  } else if (details.type == "dlc") {
    values.push("DLC");
    values.push(details.id);
  }

  return (values.join(" ") + ".cia").replace(/[<>:"/\\|?*]/g, "");
}

await (async () => {
  const args = process.argv.slice(2);
  const url = args[0];

  if (!url) {
    console.log("provide url silly :3");
    return;
  }

  const parse = parseID(url);

  if (parse) {
    const details = await parseDetails(parse);
    if (!details) return;

    console.log(
      "Downloading" +
        pc.green(
          ` ${details.title} ${details.type.at(0)?.toUpperCase() + details.type.slice(1)}${details.type == "update" ? " " + details.version.split(" ")[0] : ""}`,
        ),
    );

    const proc = Bun.spawn(
      [
        "wget",
        "-q",
        "--show-progress",
        "-O",
        fileNameFactory(details),
        details.dl,
      ],
      {
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      },
    );

    const exitCode = await proc.exited;

    process.exit(exitCode);
  }
})();
