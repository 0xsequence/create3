const { expect } = require('chai')
const { ethers } = require('hardhat')

async function deployCreate3 () {
  const Create3 = await ethers.getContractFactory('Create3')
  const create3 = await Create3.deploy()
  await create3.deployed()
  return create3
}

function genRandomBytecode (size) {
  const bytecode = ethers.utils.randomBytes(size)

  if (bytecode[0] === 239) {
    bytecode[0] = 240
  }

  return ethers.utils.hexlify(bytecode)
}

describe('Create3', () => {
  let { users, create3 } = {}

  beforeEach(async () => {
    create3 = await deployCreate3()
    users = await ethers.getSigners()
  })

  it('Should give different addresses to different senders', async () => {
    const bytecode1 = genRandomBytecode(911)
    const bytecode2 = genRandomBytecode(211)

    await create3.connect(users[1]).create(ethers.constants.HashZero, bytecode1)
    await create3.connect(users[2]).create(ethers.constants.HashZero, bytecode2)

    const address1 = await create3.addressOf(users[1].address, ethers.constants.HashZero)
    const address2 = await create3.addressOf(users[2].address, ethers.constants.HashZero)

    expect(address1).to.not.equal(address2)
    expect(await ethers.provider.getCode(address1)).to.equal(bytecode1)
    expect(await ethers.provider.getCode(address2)).to.equal(bytecode2)
  })

  it('Should fail to create contract with invalid bytecode', async () => {
    // EIP-3541 forbids the creation of contracts starting with 0xef
    const bytecode = '0xef'

    const tx = create3.create(ethers.constants.HashZero, bytecode)
    await expect(tx).to.be.reverted
  })

  it('Should fail to deploy contract if address is already in use', async () => {
    const bytecode1 = genRandomBytecode(911)
    const bytecode2 = genRandomBytecode(211)

    await create3.create(ethers.constants.HashZero, bytecode1)
    const tx = create3.create(ethers.constants.HashZero, bytecode2)

    await expect(tx).to.be.reverted
  })

  it('Should forward payable amount to child contract', async () => {
    const bytecode = genRandomBytecode(211)
    await create3.create(ethers.constants.HashZero, bytecode, { value: 2 })
    const address = await create3.addressOf(users[0].address, ethers.constants.HashZero)
    expect(await ethers.provider.getBalance(address)).to.equal(2)
  })

  it('Should empty buffer after deployment', async () => {
    const bytecode = genRandomBytecode(24576)

    await create3.create(ethers.constants.HashZero, bytecode, { gasLimit: 28000000 })

    expect(await ethers.provider.call({ to: create3.address })).to.equal('0x')
  })

  if (!process.env.COVERAGE) {
    it('Should fail to deploy contract above EIP-170 limit', async () => {
      const bytecode = genRandomBytecode(24577)

      const tx = create3.create(ethers.constants.HashZero, bytecode, { gasLimit: 28000000 })
      await expect(tx).to.be.reverted
    })
  }

  it('Should empty buffer after deployment', async () => {
    const bytecode = genRandomBytecode(24576)

    await create3.create(ethers.constants.HashZero, bytecode, { gasLimit: 28000000 })

    expect(await ethers.provider.call({ to: create3.address })).to.equal('0x')
  })

  it('Should create contracts with all bytecode sizes between 0 and 2049', async () => {
    await Promise.all(new Array(2049).fill(0).map(async (_, i) => {
      const bytecode = genRandomBytecode(i)
      const salt = ethers.utils.randomBytes(32)

      await create3.create(salt, bytecode)
      const address = await create3.addressOf(users[0].address, salt)

      expect(await ethers.provider.getCode(address)).to.equal(bytecode)
    }))
  }).timeout(15 * 60 * 1000)
})
