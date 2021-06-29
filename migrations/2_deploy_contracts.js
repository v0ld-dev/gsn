const CaptureTheFlag = artifacts.require('CaptureTheFlag')
//const WhitelistPaymaster = artifacts.require('WhitelistPaymaster')
const TokenPaymaster = artifacts.require('TokenPaymaster')
const RelayHub = artifacts.require('RelayHub')

const TestUniswap = artifacts.require('TestUniswap')
const TestToken   = artifacts.require('TestToken')
const TestTokenPermit   = artifacts.require('TestTokenPermit')



module.exports = async function (deployer) {
  const forwarder = require( '../build/gsn/Forwarder' ).address
  await deployer.deploy(CaptureTheFlag, forwarder)

  await deployer.deploy(TestUniswap, 2, 1, { value: (5e18).toString(), gas: 5721975 })
  const uniswap = await TestUniswap.deployed()

  await deployer.deploy(TestTokenPermit,"TestToken2","TK2")
  this.tokenPermit = await TestTokenPermit.deployed()
  await uniswap.pu(this.tokenPermit.address)  

  await deployer.deploy(TestToken)
  this.token = await TestToken.deployed()
  await uniswap.pu(this.token.address)

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

  await this.token.mint('0xf2EF73BAAaf9CAcde06dE3E270C31BE59e66eDF6', 101e18.toString())
  console.log('user balance: ',(await this.token.balanceOf('0xf2EF73BAAaf9CAcde06dE3E270C31BE59e66eDF6')/1e18).toString())

  await this.tokenPermit.mint('0xf2EF73BAAaf9CAcde06dE3E270C31BE59e66eDF6', 102e18.toString())
  console.log('user balance: ',(await this.tokenPermit.balanceOf('0xf2EF73BAAaf9CAcde06dE3E270C31BE59e66eDF6')/1e18).toString())

}


/*
add eth on uniswap
addToken() on paymaster
approve for uniswap from paymaster ?? 
*/
