
const UniversalDeployer = require('@0xsequence/deployer').UniversalDeployer
const { network, run } = require('hardhat')
const ethers = require('ethers')
const fs = require('fs')

const create3 = require('../artifacts/contracts/Create3.sol/Create3.json')

const txParams = {
  gasLimit: 500000
}

class Create3Factory extends ethers.ContractFactory {
  constructor (signer) {
    super(create3.abi, create3.bytecode, signer)
  }
}

const attempVerify = async (name, address, ...args) => {
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: args,
    })
  } catch (e) {
    console.info('error etherscan verify', e)
  }
}

const buildNetworkJson = (...contracts) => {
  return contracts.map((c) => ({
    contractName: c.name,
    address: c.address
  }))
}

async function main () {
  const prompt = { info: (s) => console.log(s) }

  const provider = new ethers.providers.Web3Provider(network.provider.send)
  const signer = provider.getSigner()
  const universalDeployer = new UniversalDeployer(network.name, signer.provider)

  prompt.info(`Network Name:           ${network.name}`)
  prompt.info(`Local Deployer Address: ${await signer.getAddress()}`)
  prompt.info(`Local Deployer Balance: ${await signer.getBalance()}`)

  // const create3factory = new ethers.ContractFactory(create3.abi, create3.bytecode)
  const create3Factory = await universalDeployer.deploy('Create3', Create3Factory, txParams)

  prompt.info(`writing deployment information to ${network.name}.json`)
  fs.writeFileSync(`./networks/${network.name}.json`, JSON.stringify(buildNetworkJson(
    { name: "Create3", address: create3Factory.address },
  )))

  prompt.info(`verifying contracts`)
  await attempVerify('Create3', create3Factory.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
