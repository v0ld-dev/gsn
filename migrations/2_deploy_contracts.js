const CaptureTheFlag = artifacts.require('CaptureTheFlag')
//const WhitelistPaymaster = artifacts.require('WhitelistPaymaster')
const TokenPaymaster = artifacts.require('TokenPaymasterPermitPaymaster')
const RelayHub = artifacts.require('RelayHub')

const TestUniswap = artifacts.require('TestUniswap')
const TestToken   = artifacts.require('TestToken')
const TestTokenPermit   = artifacts.require('TestTokenPermit')



module.exports = async function (deployer, networks, accounts) {
  const forwarder = require( '../build/gsn/Forwarder' ).address
  await deployer.deploy(CaptureTheFlag, forwarder)

  await deployer.deploy(TestUniswap, 2, 1, '0x0000000000000000000000000000000000000000', { value: (5e18).toString()})
  const uniswap = await TestUniswap.deployed()

  await deployer.deploy(TestTokenPermit,"TestToken2","TK2")
  this.tokenPermit = await TestTokenPermit.deployed()
  await uniswap.pu(this.tokenPermit.address)  

  await deployer.deploy(TestToken)
  this.token = await TestToken.deployed()
  await uniswap.pu(this.token.address)

  await deployer.deploy(TokenPaymaster)
  const relayHubAddress = require('../build/gsn/RelayHub.json').address
  const paymaster = await TokenPaymaster.deployed()

  await paymaster.setRelayHub(relayHubAddress)
  await paymaster.setTrustedForwarder(forwarder)

  console.log('paymaster post with precharge=', (await paymaster.gasUsedByPost()).toString())
  console.log(`RelayHub(${relayHubAddress}) set on Paymaster(${TokenPaymaster.address})`)
  const relayHub = await RelayHub.at(relayHubAddress)
  await relayHub.depositFor(paymaster.address, {value: 1e18.toString()})
  console.log(`1 ETH deposited to Paymaster(${TokenPaymaster.address})`)
  await paymaster.addToken(this.token.address, uniswap.address);
  await paymaster.addToken(this.tokenPermit.address, uniswap.address);


  await this.token.mint('0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b', web3.utils.toWei('1000000', 'ether'))
  console.log('user balance: ',(await this.token.balanceOf('0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b')/1e18).toString())

  await this.tokenPermit.mint('0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b', web3.utils.toWei('1000000', 'ether'))
  console.log('user balance: ',(await this.tokenPermit.balanceOf('0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b')/1e18).toString())

  await web3.eth.sendTransaction({from: accounts[0], to: '0x39FEA483ce65F36394e07a97fF49aE1AA653ee0b', value: web3.utils.toWei('0.5', 'ether')})

}


/*
add eth on uniswap
addToken() on paymaster
approve for uniswap from paymaster ?? 
*/
