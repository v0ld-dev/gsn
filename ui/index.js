const ethers = require('ethers')
const { formatEther } = require( 'ethers/lib/utils')
const { RelayProvider } = require( '@opengsn/provider')
const paymasterArtifact = require('../build/contracts/TokenPaymaster.json')

// In truffle console run:
// const pm = await WhitelistPaymaster.deployed()
// pm.whitelistSender('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')

const paymasterAddress = require( '../build/gsn/Paymaster').address
const contractArtifact = require('../build/contracts/CaptureTheFlag.json')
const tokenArtifact    = require('../build/contracts/TestToken.json')
const uniswapArtifact  = require('../build/contracts/TestUniswap.json')
const contractAbi = contractArtifact.abi

let theContract
let provider, networkId

async function initContract() {

  if (!window.ethereum) {
    throw new Error('provider not found')
  }
  window.ethereum.on('accountsChanged', () => {
    console.log('acct');
    window.location.reload()
  })
  window.ethereum.on('chainChanged', () => {
    console.log('chainChained');
    window.location.reload()
  })
  networkId = await window.ethereum.request({method: 'net_version'})

  const gsnProvider = await RelayProvider.newProvider( {
    provider: window.ethereum,
    config: {
        //loggerConfiguration: { logLevel: 'error' },
        paymasterAddress: paymasterArtifact.networks[networkId].address
    }
  }).init()

  provider = new ethers.providers.Web3Provider(gsnProvider)

  const network = await provider.getNetwork()
  const artifactNetwork = contractArtifact.networks[networkId]
  if (!artifactNetwork)
    throw new Error('Can\'t find deployment on network ' + networkId)
  const contractAddress = artifactNetwork.address
  theContract = new ethers.Contract(
    contractAddress, contractAbi, provider.getSigner())
  uniswap = new ethers.Contract(
    uniswapArtifact.networks[networkId].address,
    uniswapArtifact.abi, provider.getSigner())
  token = new ethers.Contract(
    await uniswap.tokenAddress(),
    tokenArtifact.abi, provider.getSigner())

  await listenToEvents()
  return {contractAddress, network}
}

async function userbalance() {
    return await token.balanceOf(provider.getSigner())
}
async function contractCall() {
  let r = await window.ethereum.send('eth_requestAccounts')
  console.log("user balance before: ", (await token.balanceOf(r.result[0])).toString())
  const transaction = await theContract.captureTheFlag()
  const hash = transaction.hash
  console.log(`Transaction ${hash} sent`)
  const receipt = await provider.waitForTransaction(hash)
  console.log(`Mined in block: ${receipt.blockNumber}`)
  console.log("user balance after: ", (await token.balanceOf(r.result[0])).toString())
}

let logview

function log(message) {
  message = message.replace(/(0x\w\w\w\w)\w*(\w\w\w\w)\b/g, '<b>$1...$2</b>')
  if (!logview) {
    logview = document.getElementById('logview')
  }
  logview.innerHTML = message + "<br>\n" + logview.innerHTML
}

async function listenToEvents() {

  theContract.on('FlagCaptured', (previousHolder, currentHolder, rawEvent) => {
    log(`Flag Captured from&nbsp;${previousHolder} by&nbsp;${currentHolder}`)
    console.log(`Flag Captured from ${previousHolder} by ${currentHolder}`)
  })
}

window.app = {
  initContract,
  contractCall,
  log
}

