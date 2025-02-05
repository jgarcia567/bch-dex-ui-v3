/*
  Shows NFTs for sale on the DEX.
*/

// Global npm libraries
import React, { useState, useEffect } from 'react'
import { Container, Row, Card, Col, Button, Spinner } from 'react-bootstrap'
import axios from 'axios'
import Jdenticon from '@chris.troutner/react-jdenticon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo } from '@fortawesome/free-solid-svg-icons'
// import RetryQueue from '@chris.troutner/retry-queue'

// Local libraries
import config from '../../../config'

// Global variables and constants
const SERVER = config.dexServer

function NftsForSale (props) {
  // Dependency injection through props
  const appData = props.appData
  console.log('NftsForSale() appData: ', appData)

  async function getNftOffers(page = 0) {
    try {
      const options = {
        method: 'GET',
        url: `${SERVER}/offer/list/nft/${page}`,
        data: {}
      }
      const result = await axios.request(options)
      console.log('result.data: ', result.data)

      const rawOffers = result.data

      const bchjs = appData.wallet.bchjs

      // Add a default icon.
      for (let i = 0; i < rawOffers.length; i++) {
        const thisOffer = rawOffers[i]

        thisOffer.icon = (<Jdenticon size='100' value={thisOffer.tokenId} />)
        thisOffer.iconDownloaded = false

        // Convert sats to BCH, and then calculate cost in USD.
        const rateInSats = parseInt(thisOffer.rateInBaseUnit)
        // console.log('rateInSats: ', rateInSats)
        const bchCost = bchjs.BitcoinCash.toBitcoinCash(rateInSats)
        // console.log('bchCost: ', bchCost)
        // console.log('bchUsdPrice: ', this.state.appData.bchWalletState.bchUsdPrice)
        const usdPrice = bchCost * appData.bchWalletState.bchUsdPrice * thisOffer.numTokens
        // usdPrice = bchjs.Util.floor2(usdPrice)
        // console.log(`usdPrice: ${usdPrice}`)
        const priceStr = `$${usdPrice.toFixed(3)}`
        thisOffer.usdPrice = priceStr
      }

      return rawOffers
    } catch(err) {
      console.error('NftsForSale() getNftOffers() error: ', err)
      return []
    }
  }

  async function handleOffers() {
    let offers = await getNftOffers()
    console.log('offers: ', offers)
  }

  async function handleStartProcessingTokens() {
    await handleOffers()
  }

  // This is an async startup function that is called by the useEffect hook.
  const asyncStartup = async () => {
    try {
      await handleStartProcessingTokens()
    } catch (error) {
      console.error('NftsForSale() asyncStartup() error: ', error)
    }
  }

  // Load NFT data when the page loads from the server or from the cache.
  useEffect(() => {
    asyncStartup()
  }, [])

  return (
    <Container>
      <Row>
        <Col>
          <h1>NFTs for Sale</h1>
        </Col>
      </Row>
    </Container>
  )
}

export default NftsForSale
