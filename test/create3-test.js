const { expect } = require('chai')
const { ethers } = require('hardhat')

async function deployCreate3 () {
  const Create3 = await ethers.getContractFactory('Create3Imp')
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
  let { create3 } = {}

  beforeEach(async () => {
    create3 = await deployCreate3()
  })

  it('Should create contract', async () => {
    const bytecode1 = genRandomBytecode(911)

    await create3.create(ethers.constants.HashZero, bytecode1)

    const address1 = await create3.addressOf(ethers.constants.HashZero)

    expect(await ethers.provider.getCode(address1)).to.equal(bytecode1)
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
    const address = await create3.addressOf(ethers.constants.HashZero)
    expect(await ethers.provider.getBalance(address)).to.equal(2)
  })

  if (!process.env.COVERAGE) {
    it('Should fail to deploy contract above EIP-170 limit', async () => {
      const bytecode = genRandomBytecode(24577)

      const tx = create3.create(ethers.constants.HashZero, bytecode, { gasLimit: 28000000 })
      await expect(tx).to.be.reverted
    })
  }

  it('Should fail to create empty contract', async () => {
    const bytecode = '0x'
    const salt = ethers.utils.randomBytes(32)

    const tx = create3.create(salt, bytecode)
    await expect(tx).to.be.reverted
  })

  it('Should create contracts with all bytecode sizes between 0 and 2049', async () => {
    await Promise.all(new Array(2049).fill(0).map(async (_, i) => {
      const bytecode = genRandomBytecode(i + 1)
      const salt = ethers.utils.randomBytes(32)

      await create3.create(salt, bytecode)
      const address = await create3.addressOf(salt)

      expect(await ethers.provider.getCode(address)).to.equal(bytecode)
    }))
  }).timeout(15 * 60 * 1000)
})
