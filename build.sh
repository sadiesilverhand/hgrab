rm ~/.local/bin/hgrab
bun build ./index.ts --compile --outfile ./hgrab
cp ./hgrab ~/.local/bin