import { dirname } from "node:path";

export async function generateForwarder(
    path: string,
    pathOnSD: string,
): Promise<string> {
    return new Promise(async (r) => {
        const binary = process.env.YANBF_BINARY ?? "yanbf";

        const out = path.replace(".cia", "") + ".nds";

        const cwd = process.cwd();

        const binPathExec = Bun.spawn(["which", "yanbf"], {
            stdout: "pipe",
            stderr: "pipe",
        });

        const output = await binPathExec.stdout.text();
        const error = await binPathExec.stderr.text();

        let binPath = binary;

        if (!error?.includes("no yanbf in")) {
            binPath = output;
        }

        const proc = Bun.spawn(
            [binary, cwd + "/" + path, "-p", pathOnSD, "-o", cwd + "/" + out],
            {
                stdin: "inherit",
                stdout: "inherit",
                stderr: "inherit",
                env: {
                    ...process.env,
                    // weird pyinstaller bug, for some reason it bundles an old libreadline which lacks `rl_trim_arg_from_keyseq` -_-
                    LD_PRELOAD: "/usr/lib/libreadline.so.8",
                },
                cwd: dirname(binPath),
            },
        );

        const exitCode = await proc.exited;

        if (exitCode !== 0) {
            throw "exited with code " + exitCode;
        }

        r(out);
    });
}
