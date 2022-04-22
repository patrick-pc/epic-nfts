import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import myEpicNft from './utils/MyEpicNFT.json'
import './App.css'
import twitterLogo from './twitter-logo.svg'

// Constants
const TWITTER_HANDLE = 'web3slinger'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const OPENSEA_LINK = ''
const TOTAL_MINT_COUNT = 50
const CONTRACT_ADDRESS = '0xD61B1D54B699362fd9C88Ae108aDFbc577809dC5'
const COLLECTION_SLUG = 'squarenft-agffrxbtxh'

function App() {
  const [currentAccount, setCurrentAccount] = useState('')
  const [isMining, setIsMining] = useState(false)
  const [mintCount, setMintCount] = useState(0)

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    let chainId = await ethereum.request({ method: 'eth_chainId' })
    console.log('Connected to chain ' + chainId)

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = '0x4'
    if (chainId !== rinkebyChainId) {
      alert('You are not connected to the Rinkeby Test Network!')
      return
    }

    if (!ethereum) {
      console.log('Make sure you have metamask!')
      return
    } else {
      console.log('We have the ethereum object', ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)
      setCurrentAccount(account)
      setupEventListener()
    } else {
      console.log('No authorized accounts found')
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Install MetaMask to continue')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Connected', accounts[0])
      setCurrentAccount(accounts[0])
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        )

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setMintCount(tokenId.toNumber())
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          )
        })

        console.log('Setup event listener!')
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window

      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain ' + chainId)

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = '0x4'
      if (chainId !== rinkebyChainId) {
        alert('You are not connected to the Rinkeby Test Network!')
        return
      }

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        )

        console.log('Going to pop wallet now to pay gas...')
        let nftTxn = await connectedContract.makeAnEpicNFT()

        console.log('Mining...please wait.')
        setIsMining(true)
        await nftTxn.wait()
        setIsMining(false)

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        )
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  )

  const renderMintUI = () => (
    <>
      <div className='mint-count'>{mintCount} / 50 minted</div>
      <button
        onClick={askContractToMintNft}
        className="cta-button connect-wallet-button"
        disabled={isMining}
      >
        {isMining ? 'Mining...' : 'Mint NFT'}
      </button>
    </>
  )

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [currentAccount])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Epic NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === ''
            ? renderNotConnectedContainer()
            : renderMintUI()}
          <br />
          <a
            href={`https://testnets.opensea.io/collection/${COLLECTION_SLUG}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              onClick={connectWallet}
              className="cta-button opensea-button"
            >
              Browse Collection
            </button>
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
