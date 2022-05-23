import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Web3Modal from "web3modal"
import { providers, Contract } from 'ethers'
import { useEffect, useState, useRef } from 'react'
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants'

const Home: NextPage = () => {

  const [walletConnected, setWalletConnected] = useState<boolean>(false)

  const [joinedWhitelist, setJoinedWhitelist] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(false)

  const [numOfWhtelisted, setNumberOfWhitelisted] = useState<number>(0)

  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner: boolean = false): Promise<any> => {
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()

    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby")
      throw new Error("Change network to Rinkeby")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer;
    }

    return web3Provider;
  }

  const addAddressToWhitelist = async (): Promise<void> => {
    try {

      const signer = await getProviderOrSigner(true)

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true)

      await tx.wait()
      setLoading(false)

      await getNumberOfWhitelisted()
      setJoinedWhitelist(true)
    } catch (err) {
      console.error(err)
    }
  }

  const getNumberOfWhitelisted = async (): Promise<void> => {
    try {
      const provider = await getProviderOrSigner()

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      )

      const _numberofWhitelisted = await whitelistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numberofWhitelisted)
    } catch (err) {
      console.error(err)
    }
  }

  const checkIfAddressInWhitelist = async (): Promise<void> => {
    try {

      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();

      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);

    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async (): Promise<void> => {
    try {

      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = (): JSX.Element => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className='self-start mx-2 text-lg font-semibold text-green-500'>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className='self-start p-2 border-none bg-yellow-200 rounded-md animate-pulse'>Loading...</button>;
      } else {
        return (
          <button className='self-start mx-2 p-2 border rounded-md bg-blue-400' onClick={addAddressToWhitelist}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button className='self-start mx-2 p-2 border rounded-md bg-green-500' onClick={connectWallet}>
          Connect your wallet
        </button>
      );
    }
  };

  useEffect((): void => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet
    }
  }, [walletConnected])

  return (
    <div className='flex flex-col justify-evenly'>
      <Head>
        <title>Whitelist DApp</title>
        <meta name="description" content="Whitelist-DApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className='min-h-[90vh] flex justify-center items-center font-[Courier New] mx-6'> {/* main */}
          <div className='flex flex-col gap-4'>
            <h1 className='text-[2rem] mx-2 font-extrabold'>Welcome to Crytpo Devs!</h1>{/*  //title */}
            <div className='leading-4 mx-2 text-xl'> {/* // description */}
              Its an NFT collection for developers in Crypto.
            </div>
            <div className='leading-4 mx-2 text-xl'> {/* // description */}
              {numOfWhtelisted} have already joined the Whitelist 🚀
            </div>
            {renderButton()}
          </div>
          
           {/*  <Image className='' src='/crypto-devs.svg' width='50%' height='70%' /> */}
           <img src='/crypto-devs.svg' className='w-[50%] h-[70%] ml-[20%]' />
          
        </div>

      </div>
      <footer className='self-center px-2'>{/* footer */}
        Made with &#10084; by Crypto Devs
      </footer>

    </div>
  )
}

export default Home
