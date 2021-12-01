set -e

echo ""
echo "Building UI files"
npx webpack --node-env='production'

echo ""
echo "Compiling TypeScript"
npx tsc -p ./tsconfig.json

echo ""
echo "Copying files"
cp app/api-bridge.js build/app
cp package* build/

echo ""
echo "Node Moduling"
(cd ./build/ && npm i --omit="dev" && npm i electron-rebuild)
(cd ./build && ./node_modules/.bin/electron-rebuild > /dev/null)

echo "Electron Packaging"
./node_modules/.bin/electron-packager ./build Stuart --platform=win32 --arch=x64 --out='../release'