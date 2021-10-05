
const hre = require('hardhat')
const ethers = require('ethers')

function genRandomBytecode (size) {
  const bytecode = ethers.utils.randomBytes(size)

  if (bytecode[0] === 239) {
    bytecode[0] = 240
  }

  return bytecode
}

async function main () {
  const OgCreates = await hre.ethers.getContractFactory('OgCreates')
  const Create3 = await hre.ethers.getContractFactory('Create3Imp')

  const ogcreates = await OgCreates.deploy()
  const create3 = await Create3.deploy()

  await Promise.all([ogcreates.deployed(), create3.deployed()])

  const bytecode = genRandomBytecode(24576)

  // let results = []

  const createCsvWriter = require('csv-writer').createObjectCsvWriter
  const csvWriter = createCsvWriter({
    path: './cost.csv',
    header: [
      { id: 'size', title: 'SIZE' },
      { id: 'create1', title: 'CREATE1' },
      { id: 'create2', title: 'CREATE2' },
      { id: 'create3', title: 'CREATE3' }
    ]
  })

  for (let i = 1; i < bytecode.length; i++) {
    const slice = ethers.utils.hexlify(bytecode.slice(0, i))

    const c1 = await (async () => {
      // CREATE1
      const tx = await ogcreates.create1(slice, { gasLimit: 29000000 })
      const receipt = await tx.wait()
      return receipt.gasUsed
    })()

    const salt = ethers.utils.hexZeroPad(i, 32)

    const c2 = await (async () => {
      // CREATE2
      const tx = await ogcreates.create2(slice, salt, { gasLimit: 29000000 })
      const receipt = await tx.wait()
      return receipt.gasUsed
    })()

    const c3 = await (async () => {
      // CREATE3
      const tx = await create3.create(salt, slice, { gasLimit: 29000000 })
      const receipt = await tx.wait()
      return receipt.gasUsed
    })()

    await csvWriter.writeRecords([{ size: i, create1: c1.toString(), create2: c2.toString(), create3: c3.toString() }])
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
