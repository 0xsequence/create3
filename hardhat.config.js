require('dotenv').config()

require('@nomiclabs/hardhat-etherscan')
require('@nomiclabs/hardhat-waffle')
require('hardhat-gas-reporter')
require('solidity-coverage')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

const networkRpcUrl = (network) => {
  if (process.env[`NODE_${network.toUpperCase()}`] !== undefined) {
    return process.env[`NODE_${network.toUpperCase()}`]
  }

  switch (network) {
    case 'mumbai':
      return 'https://rpc-mumbai.maticvigil.com/'

    case 'matic':
      return 'https://nodes.sequence.app/matic'

    case 'arbitrum-testnet':
      return 'https://rinkeby.arbitrum.io/rpc'

    case 'arbitrum':
      return 'https://arb1.arbitrum.io/rpc'

    default:
      return `https://${network}.infura.io/v3/${process.env.INFURA_KEY}`
  }
}

const networkConfig = (network) => {
  return {
    url: networkRpcUrl(network),
    accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.9',
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0 // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    mainnet: networkConfig('mainnet'),
    ropsten: networkConfig('ropsten'),
    rinkeby: networkConfig('rinkeby'),
    kovan: networkConfig('kovan'),
    goerli: networkConfig('goerli'),
    matic: networkConfig('matic'),
    mumbai: networkConfig('mumbai'),
    arbitrum: networkConfig('arbitrum'),
    arbitrumTestnet: networkConfig('arbitrum-testnet')
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
}
