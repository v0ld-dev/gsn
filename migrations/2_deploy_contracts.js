const CaptureTheFlag = artifacts.require('CaptureTheFlag')
//const WhitelistPaymaster = artifacts.require('WhitelistPaymaster')
const TokenPaymaster = artifacts.require('TokenPaymaster')
const RelayHub = artifacts.require('RelayHub')

const TestUniswap = artifacts.require('TestUniswap')
const TestToken   = artifacts.require('TestToken')



module.exports = async function (deployer) {
  const forwarder = require( '../build/gsn/Forwarder' ).address
  await deployer.deploy(CaptureTheFlag, forwarder)

  await deployer.deploy(TestUniswap, 2, 1, { value: (5e18).toString(), gas: 5721975 })
  const uniswap = await TestUniswap.deployed()
  this.token = await TestToken.at(await uniswap.tokenAddress())
  console.log('Token address= ',this.token.address)


  await deployer.deploy(TokenPaymaster, [uniswap.address])
  const relayHubAddress = require('../build/gsn/RelayHub.json').address
  const paymaster = await TokenPaymaster.deployed()
  await paymaster.setRelayHub(relayHubAddress)
  await paymaster.setTrustedForwarder(forwarder)

  console.log('paymaster post with precharge=', (await paymaster.gasUsedByPost()).toString())
  console.log(`RelayHub(${relayHubAddress}) set on Paymaster(${TokenPaymaster.address})`)
  const relayHub = await RelayHub.at(relayHubAddress)
  await relayHub.depositFor(paymaster.address, {value: 1e18.toString()})
  console.log(`1 ETH deposited to Paymaster(${TokenPaymaster.address})`)

  await this.token.mint('0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b', 100e18.toString(), [uniswap.address, paymaster.address])
  console.log('user balance: ',(await this.token.balanceOf('0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b')).toString())

}
