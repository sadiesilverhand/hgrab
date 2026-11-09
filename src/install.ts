import { readdir } from "node:fs/promises";

// huge thanks to https://github-wiki-see.page/m/ihaveamac/3ds-rom-tools/wiki/seeddb-list
export const seedPath = "/tmp/hgrab-seeddb.bin";

export async function loadSeedDB(): Promise<void> {
    return new Promise(async (r) => {
        const exists = await Bun.file(seedPath).exists();

        if (exists) {
            console.log("seeddb already downloaded");
            return r();
        }

        console.log("downloading seeddb...");

        const response = await fetch(
            "https://github.com/ihaveamac/3DS-rom-tools/raw/master/seeddb/seeddb.bin",
        );

        const data = await response.arrayBuffer();

        if (data.byteLength === 0) {
            throw new Error("downloaded db is empty ??");
        }

        await Bun.write(seedPath, data);

        console.log("loaded seeddb");

        r();
    });
}

// very shoddy and probably inconsistent across decives but it's probably "good enough"
export async function find3DSMount(): Promise<string | undefined> {
    return new Promise(async (r) => {
        const mounts = await Bun.file("/proc/mounts").text();

        const drives = mounts
            .trim()
            .split("\n")
            .map((line) => {
                return line.split(" ")[1];
            })
            .filter((p) => {
                if (!p) return false;

                let isVirtual = false;

                [
                    "docker",
                    "/home",
                    "/var",
                    "/boot",
                    "/tmp",
                    "/proc",
                    "/sys",
                    "/dev",
                ].forEach((v) => {
                    if (p.includes(v)) {
                        isVirtual = true;
                    }
                });

                if (["/", "/run"].includes(p)) isVirtual = true;

                if (p.startsWith("/run") && !p.startsWith("/run/media"))
                    isVirtual = true;

                return !isVirtual;
            });

        drives.forEach(async (d) => {
            if (!d) return;

            const read = await readdir(d, {
                recursive: false,
            });

            let hasDataDir = false;
            let hasGM9Dir = false;

            read.forEach((r) => {
                if (r.split("/").pop() == "Nintendo 3DS") hasDataDir = true;
                if (r.split("/").pop() == "gm9") hasGM9Dir = true;
            });

            if (hasDataDir && hasGM9Dir) {
                r(d);
            }
        });
    });
}
