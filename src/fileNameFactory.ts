import type { GameDetails } from "./parseDetails";

export function fileNameFactory(details: GameDetails) {
  let values = [];

  values.push(details.title);

  if (details.type == "base") {
    values.push("Base");
  } else if (details.type == "update") {
    values.push("Update");
    values.push(details.version.split(" ")[0]);
  } else if (details.type == "dlc") {
    values.push("DLC");
    values.push(details.id);
  }

  return (values.join(" ") + "." + details.extension).replace(/[<>:"/\\|?*]/g, "");
}
