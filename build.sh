rm ~/.local/bin/hgrab
bun build ./src/index.ts --compile --outfile ./hgrab
cp ./hgrab ~/.local/bin