import { HDWallet } from '@shapeshiftoss/hdwallet-core'
import { ChainTypes, ExecQuoteInput, SwapperType } from '@shapeshiftoss/types'

import { setupQuote } from '../utils/test-data/setupSwapQuote'
import { ZrxSwapperDeps } from '../ZrxSwapper'
import { ZrxExecuteQuote } from './ZrxExecuteQuote'

describe('ZrxExecuteQuote', () => {
  const { quoteInput, sellAsset } = setupQuote()
  const txid = '0xffaac3dd529171e8a9a2adaf36b0344877c4894720d65dfd86e4b3a56c5a857e'
  let wallet = ({
    supportsOfflineSigning: jest.fn(() => true)
  } as unknown) as HDWallet
  const adapterManager = {
    byChain: jest.fn(() => ({
      buildBIP32Params: jest.fn(() => ({ purpose: 44, coinType: 60, accountNumber: 0 })),
      buildSendTransaction: jest.fn(() => Promise.resolve({ txToSign: '0000000000000000' })),
      signTransaction: jest.fn(() => Promise.resolve('0000000000000000000')),
      broadcastTransaction: jest.fn(() => Promise.resolve(txid)),
      signAndBroadcastTransaction: jest.fn(() => Promise.resolve(txid))
    }))
  }
  const deps = ({ adapterManager } as unknown) as ZrxSwapperDeps

  it('throws an error if quote.success is false', async () => {
    const args = {
      quote: { ...quoteInput, success: false },
      wallet
    }
    await expect(ZrxExecuteQuote(deps, args)).rejects.toThrow(
      'ZrxSwapper:ZrxExecuteQuote Cannot execute a failed quote'
    )
  })

  it('throws an error if sellAsset.network is not provided', async () => {
    const args = ({
      quote: { ...quoteInput, sellAsset: { ...sellAsset, network: '' } },
      wallet
    } as unknown) as ExecQuoteInput<ChainTypes, SwapperType>
    await expect(ZrxExecuteQuote(deps, args)).rejects.toThrow(
      'ZrxSwapper:ZrxExecuteQuote sellAssetNetwork and sellAssetSymbol are required'
    )
  })

  it('throws an error if sellAsset.symbol is not provided', async () => {
    const args = {
      quote: { ...quoteInput, sellAsset: { ...sellAsset, symbol: '' } },
      wallet
    }
    await expect(ZrxExecuteQuote(deps, args)).rejects.toThrow(
      'ZrxSwapper:ZrxExecuteQuote sellAssetNetwork and sellAssetSymbol are required'
    )
  })

  it('throws an error if quote.sellAssetAccountId is not provided', async () => {
    const args = {
      quote: { ...quoteInput, sellAssetAccountId: '' },
      wallet
    }
    await expect(ZrxExecuteQuote(deps, args)).rejects.toThrow(
      'ZrxSwapper:ZrxExecuteQuote sellAssetAccountId is required'
    )
  })

  it('throws an error if quote.sellAmount is not provided', async () => {
    const args = {
      quote: { ...quoteInput, sellAmount: '' },
      wallet
    }
    await expect(ZrxExecuteQuote(deps, args)).rejects.toThrow(
      'ZrxSwapper:ZrxExecuteQuote sellAmount is required'
    )
  })

  it('throws an error if quote.depositAddress is not provided', async () => {
    const args = {
      quote: { ...quoteInput, depositAddress: '' },
      wallet
    }
    await expect(ZrxExecuteQuote(deps, args)).rejects.toThrow(
      'ZrxSwapper:ZrxExecuteQuote depositAddress is required'
    )
  })

  it('returns txid if offline signing is supported', async () => {
    const args = {
      quote: { ...quoteInput, depositAddress: '0x728F1973c71f7567dE2a34Fa2838D4F0FB7f9765' },
      wallet
    }

    expect(await ZrxExecuteQuote(deps, args)).toEqual({ txid })
  })

  it('returns txid if offline signing is unsupported', async () => {
    wallet = ({
      supportsOfflineSigning: jest.fn(() => false),
      supportsBroadcast: jest.fn(() => true)
    } as unknown) as HDWallet
    const args = {
      quote: { ...quoteInput, depositAddress: '0x728F1973c71f7567dE2a34Fa2838D4F0FB7f9765' },
      wallet
    }

    expect(await ZrxExecuteQuote(deps, args)).toEqual({ txid })
  })
})
