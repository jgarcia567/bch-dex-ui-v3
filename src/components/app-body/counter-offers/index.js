/*
  Shows Counter Offers created by the user.
*/

// Global npm libraries
import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Spinner } from 'react-bootstrap'

// Local libraries
import CounterOfferCard from './counter-offer-card'
import AsyncLoad from '../../../services/async-load'

function CounterOffers (props) {
  const appData = props.appData

  const [counterOffers, setCounterOffers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Generate counter offer cards
  const generateCards = () => {
    return counterOffers.map((offer) => (
      <CounterOfferCard
        key={offer.id}
        offer={offer}
        appData={appData}
      />
    ))
  }

  useEffect(() => {
    const loadWallet = async () => {
      try {
        setIsLoading(true)
        const { bchWalletState, serverUrl } = appData
        const asyncLoad = new AsyncLoad()
        await asyncLoad.loadWalletLib()
        const counterOfferWallet = await asyncLoad.getDerivatedWallet(serverUrl, bchWalletState.mnemonic, "m/44'/245'/0'/0/1")

        const utxoStore = counterOfferWallet.utxos.utxoStore
        const bchUtxos = utxoStore.bchUtxos
        setCounterOffers(bchUtxos)
        console.log('counterOffers', bchUtxos)
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        console.log('error', error)
      }
    }

    loadWallet()
  }, [appData])

  return (
    <Container>
      <Row>
        <Col>
          <h1>Counter Offers</h1>
          <p className='text-muted'>Your pending counter offers</p>
        </Col>
      </Row>
      {isLoading
        ? (
          <Row className='text-center' style={{ padding: '50px' }}>
            <Col>
              <Spinner animation='border' role='status'>
                <span className='visually-hidden'>Loading...</span>
              </Spinner>
              <p className='mt-3 text-muted'>Loading counter offers...</p>
            </Col>
          </Row>
          )
        : (
          <>
            <Row>
              {generateCards()}
            </Row>
            {counterOffers.length === 0 && (
              <Row className='text-center'>
                <Col>
                  <p>No counter offers found.</p>
                </Col>
              </Row>
            )}
          </>
          )}
    </Container>
  )
}

export default CounterOffers
