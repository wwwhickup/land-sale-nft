all: build

build: contracts/MultiverseMetaLand.sol
	npx hardhat compile
	npx hardhat print-abi-lib > lib/index.ts
	npx hardhat print-bytecode-lib > lib/testing.ts

install:
	npm install

test: build
	npm test

clean:  # Nothing to do.