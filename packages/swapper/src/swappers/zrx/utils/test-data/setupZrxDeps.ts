import { ChainAdapterManager } from '@shapeshiftoss/chain-adapters'
import { chainAdapters, ChainTypes } from '@shapeshiftoss/types'
import Web3 from 'web3'

jest.mock('@shapeshiftoss/chain-adapters')

export const chainAdapterMockFuncs = {
  buildBIP32Params: jest.fn(() => ({ purpose: 44, coinType: 60, accountNumber: 0 })),
  buildSendTransaction: jest.fn(() => Promise.resolve({ txToSign: {} })),
  signTransaction: jest.fn(() => Promise.resolve('signedTx')),
  broadcastTransaction: jest.fn(() => Promise.resolve('broadcastedTx')),
  getInfo: jest.fn(() => Promise.resolve({ data: { network: 'mainnet' } })),
  getAddress: jest.fn(() => Promise.resolve('address')),
  getAccount: jest.fn(() =>
    Promise.resolve({
      chainSpecific: { tokens: [{ caip19: 'eip155:1/erc20:contractAddress', balance: '1000000' }] }
    })
  ),
  getFeeData: jest.fn(() =>
    Promise.resolve({
      [chainAdapters.FeeDataKey.Average]: { txFee: '10000' }
    })
  )
}

// @ts-ignore
ChainAdapterManager.mockImplementation(() => ({
  byChain: jest.fn(() => chainAdapterMockFuncs)
}))

export const setupZrxDeps = () => {
  const unchainedUrls = {
    [ChainTypes.Bitcoin]: {
      httpUrl: 'https://api.bitcoin.shapeshift.com',
      wsUrl: 'wss://api.bitcoin.shapeshift.com'
    },
    [ChainTypes.Ethereum]: {
      httpUrl: 'https://api.ethereum.shapeshift.com',
      wsUrl: 'wss://api.ethereum.shapeshift.com'
    }
  }
  const ethNodeUrl = 'http://localhost:1000'
  const adapterManager = new ChainAdapterManager(unchainedUrls)
  const web3Provider = new Web3.providers.HttpProvider(ethNodeUrl)
  const web3Instance = new Web3(web3Provider)

  return { web3Instance, adapterManager }
}
