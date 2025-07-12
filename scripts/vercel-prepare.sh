# Clone nodejs/node to ./node
git clone https://github.com/nodejs/node.git --depth 1 node

# Install npm dependencies
npm ci

# Create the ./out directory
mkdir -p out
