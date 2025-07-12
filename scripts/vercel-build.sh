echo "Generating man page (node.1)"
node bin/cli.mjs generate \
  -t man-page \
  -i "./node/doc/api/cli.md" \
  -o "./node/node.1" \
  --skip-lint

echo "Generating addon tests"
node bin/cli.mjs generate \
  -t addon-verify \
  -i "./node/doc/api/addons.md" \
  -o "./node/test/addons" \
  --skip-lint

echo "Generating API doc links"
node bin/cli.mjs generate \
  -t api-links \
  -i "./node/lib/*.js" \
  -o "./out" \
  --skip-lint

echo "Generating API docs: orama-db, legacy-json, llms-txt, web"
node bin/cli.mjs generate \
  -t orama-db \
  -t legacy-json \
  -t llms-txt \
  -t web \
  -i "./node/doc/api/*.md" \
  -o "./out" \
  --index "./node/doc/api/index.md" \
  --skip-lint

echo "Deleting ./node"
rm -rf node/
