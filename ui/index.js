const ethers = require('ethers')
const { formatEther } = require( 'ethers/lib/utils')
const { RelayProvider } = require( '@opengsn/provider')
const paymasterArtifact = require('../build/contracts/TokenPaymasterPermitPaymaster.json')

// In truffle console run:
// const pm = await WhitelistPaymaster.deployed()
// pm.whitelistSender('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')

const paymasterAddress = require( '../build/gsn/Paymaster').address
const contractArtifact = require('../build/contracts/CaptureTheFlag.json')
const tokenArtifact    = require('../build/contracts/TestToken.json')
const tokenPermitArtifact    = require('../build/contracts/TestTokenPermit.json')
const uniswapArtifact  = require('../build/contracts/TestUniswap.json')
const contractAbi = contractArtifact.abi

const PERMIT_TYPEHASH = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'))

let theContract,
    uniswap,
    token,
    tokenPermit,
    provider,
    networkId,
    userAccount


async function initContract() {

  userAccount = await window.ethereum.send('eth_requestAccounts')

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
  const acc = provider.getSigner() 
  return {acc, network}
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

async function contractCallTk1() {

        const asyncApprovalData = async function (relayRequest){
          return Promise.resolve('0x')
        }
        const asyncPaymasterData = async function (relayRequest) {
          return Promise.resolve(ethers.utils.defaultAbiCoder.encode(['address'],[tokenPermitArtifact.networks[networkId].address]))
        }

         const gsnProvider = await RelayProvider.newProvider( {
          provider: window.ethereum,
          overrideDependencies:{ asyncApprovalData, asyncPaymasterData },
          config: {
              //loggerConfiguration: { logLevel: 'error' },
              paymasterAddress: paymasterArtifact.networks[networkId].address
          }
        }).init()

        provider = new ethers.providers.Web3Provider(gsnProvider)


    let month = 60 * 60 * 24 * 30
    let deadlineForSignature = Math.ceil(Date.now() / 1000) + month
      tokenPermit = new ethers.Contract(tokenPermitArtifact.networks[networkId].address, tokenPermitArtifact.abi, provider.getSigner())
      theContract = new ethers.Contract(contractArtifact.networks[networkId].address, contractAbi, provider.getSigner())

    let r = await window.ethereum.send('eth_requestAccounts')
    console.log("user balance before: ", (await tokenPermit.balanceOf(r.result[0])).toString(), await tokenPermit.symbol())

    let nonce = (await tokenPermit.nonces(r.result[0])).toNumber()
    // (alpaca888Address, PORTAL_ADDRESS[chainId1], value.toString(),
    let DOMAIN_SEPARATOR = getDomainSeparator("SEPARATOR", tokenPermit.address, provider.getSigner().chainId)
console.log(DOMAIN_SEPARATOR)
    // Get the EIP712 digest
    //const digest = getPermitDigest(name, token.address, provider.getNetwork().chainId, approve, nonce, deadlineForSignature)
    

    
    /*const transaction = await theContract.captureTheFlag()
    const hash = transaction.hash
    console.log(`Transaction ${hash} sent`)
    const receipt = await provider.waitForTransaction(hash)
    console.log(`Mined in block: ${receipt.blockNumber}`)
    console.log("user balance after: ", (await tokenPermit.balanceOf(r.result[0])).toString())*/
}


/********************************************************************
*
*  Excute captureTheFlag() through gasless provider. Before was executed 'approve'.
*
***********************************************************************/
async function contractCallTk2() {

    /* overide for useful usage  */
    const asyncApprovalData = async function (relayRequest){
      return Promise.resolve('0x')
    }
    /* overide for useful usage  */
    const asyncPaymasterData = async function (relayRequest) {
      return Promise.resolve(ethers.utils.defaultAbiCoder.encode(['address'],[tokenArtifact.networks[networkId].address]))
    }

    /* prepate gasless wrap for provider */
    const gsnProvider = await RelayProvider.newProvider( {
      provider: window.ethereum,
      overrideDependencies:{ asyncApprovalData, asyncPaymasterData },
      config: {
          //loggerConfiguration: { logLevel: 'error' },
          paymasterAddress: paymasterArtifact.networks[networkId].address
      }
    }).init()

    provider = new ethers.providers.Web3Provider(gsnProvider)
    theContract = new ethers.Contract(contractArtifact.networks[networkId].address, contractAbi, provider.getSigner())
    token       = new ethers.Contract(tokenArtifact.networks[networkId].address,tokenArtifact.abi, provider.getSigner())
    
    /*****
    // user will not payed for this tx
    ******/
    const transaction = await theContract.captureTheFlag()
    const hash = transaction.hash
    console.log(`Transaction ${hash} sent`)
    const receipt = await provider.waitForTransaction(hash)
    console.log(`Mined in block: ${receipt.blockNumber}`)
    console.log(`Tx was sended from: ${receipt.from}`)
    console.log("user balance after: ", (await token.balanceOf(userAccount.result[0])).toString())
}

/********************************************************************
*
*  Approve in case when token does't have permit implementation
*
***********************************************************************/
async function approveTk2() {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    token    = new ethers.Contract(tokenArtifact.networks[networkId].address,tokenArtifact.abi, provider.getSigner())
    await token.functions.approve(paymasterArtifact.networks[networkId].address, ethers.utils.parseEther('10000'))
}


async function getDomainSeparator(name, contractAddress, chainId) { console.log(chainId)
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name)),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1')),
        chainId,
        contractAddress,
      ]
    )
  )
}



window.app = {
  initContract,
  contractCall,
  contractCallTk1,
  contractCallTk2,
  approveTk2,
  log
}

