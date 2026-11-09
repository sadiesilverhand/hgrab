# hgrab
a tiny util to download and install neatly named files from hshop

supports base game, updates, dlc & nds games

## usage

```bash
hgrab https://hshop.erista.me/t/861 
```

```bash
hgrab https://download4.erista.me/content/861?token=...
```

(supports both page and direct file)

## developer
to install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To install:

```bash
chmod +x ./build.sh
./build.sh
```

## dependencies (system agnostic)
`custominstall`
`YANBF` (https://github.com/YANBForwarder/YANBF)
in the case of yanbf, ensure the `generator` binary is in your PATH as `yanbf`, or set the YANBF_BINARY env to its location

## notes 
i would prefer to use something more usage agnostic and easier to bundle than yanbf, but it's the simplest solution for now
hgrab currently does not support disabling forwarder creation for nds games

## relevant repos
[NRT_Forwarder](https://github.com/RocketRobz/NTR_Forwarder)
[YANBF](https://github.com/YANBForwarder/YANBF)