
const UniversalDeployer = require('@0xsequence/deployer').UniversalDeployer
const { network, run, tenderly } = require('hardhat')
const ethers = require('ethers')

async function main () {
  const prompt = { info: (s) => console.log(s) }

  const provider = new ethers.providers.Web3Provider(network.provider.send)
  const signer = provider.getSigner()
  const universalDeployer = new UniversalDeployer(network.name, signer.provider)

  prompt.info(`Network Name:           ${network.name}`)
  prompt.info(`Local Deployer Address: ${await signer.getAddress()}`)
  prompt.info(`Local Deployer Balance: ${await signer.getBalance()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
