import pc from "picocolors";
import { fileNameFactory } from "./fileNameFactory";
import { parseID, parseDetails } from "./parseDetails";
import { find3DSMount, loadSeedDB, seedPath } from "./install";
import { unlink } from "node:fs/promises";
import { generateForwarder } from "./forwarder";
import { copyFile } from "node:fs/promises";

await (async () => {
    const args = process.argv.slice(2);

    // definitely accurate and foolproof guys
    const url = args.find((v) => v.startsWith("http"));

    let install = false;
    let deleteAfter = false;

    if (args.includes("-h")) {
        console.log(
            `
            USAGE

            hgrab $(url) [...args]

            ARGS

            [i] - install the game after download
            [ra] - remove the game after install
        `,
        );

        return;
    }
    args.forEach((a) => {
        if (a == "-i") install = true;
        if (a == "-ra") deleteAfter = true;
    });

    if (!url) {
        console.log("provide url silly :3");
        return;
    }

    const parse = parseID(url);

    if (parse) {
        const details = await parseDetails(parse);
        if (!details) {
            console.log(
                "could not parse details, try loading the page and ensuring the captcha is completed?",
            );
            return;
        }

        console.log(
            "Downloading" +
                pc.green(
                    ` ${details.title} ${details.type.at(0)?.toUpperCase() + details.type.slice(1)}${details.type == "update" ? " " + details.version.split(" ")[0] : ""}`,
                ),
        );

        const fileName = fileNameFactory(details);

        let proc = Bun.spawn(
            ["wget", "-q", "--show-progress", "-O", fileName, details.dl],
            {
                stdin: "inherit",
                stdout: "inherit",
                stderr: "inherit",
            },
        );

        let exitCode = await proc.exited;

        const nds = details.extension == "nds";

        if (!install) process.exit(exitCode);

        console.log("installing file :3");

        const mount = await find3DSMount();

        if (!mount) {
            throw "could not find mounted 3ds card";
        }

        console.log("found mounted sd card at ", mount);

        // TODO: ensure the required files are actually in gm9/

        await loadSeedDB();

        let forwarderPath = "";

        if (nds) {
            const ndsPath = "/roms/nds/" + fileName;

            forwarderPath = await generateForwarder(
                fileName,
                ndsPath,
            );

            await copyFile(fileName, mount + ndsPath)
        }

        proc = Bun.spawn(
            [
                "custominstall",
                nds ? forwarderPath : fileName,
                "-m",
                mount + "/gm9/out/movable.sed",
                "-b",
                mount + "/gm9/out/boot9.bin",
                "-s",
                seedPath,
                "--sd",
                mount,
            ],
            {
                stdin: "inherit",
                stdout: "inherit",
                stderr: "inherit",
                env: {
                    ...process.env,
                    SEEDDB_PATH: seedPath,
                },
            },
        );

        exitCode = await proc.exited;

        if (deleteAfter) {
            console.log("removing leftover cia..");
            await unlink(fileName);
            if (nds) {
                await unlink(forwarderPath);
            }
        }

        console.log("all done.. enjoy !! :P");

        process.exit(exitCode);
    }
})();
