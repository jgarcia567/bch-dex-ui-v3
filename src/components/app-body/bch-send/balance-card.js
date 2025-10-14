/*
  This card displays the users balance in  BCH.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoins } from '@fortawesome/free-solid-svg-icons'

const BalanceCard = (props) => {
  const { appData } = props

  const bchjs = appData.wallet.bchjs
  const sats = appData.bchWalletState.bchBalance
  const bchBalance = bchjs.BitcoinCash.toBitcoinCash(sats)
  const usdBalance = bchjs.Util.floor2(bchBalance * appData.bchWalletState.bchUsdPrice)
  const { bchInitLoaded, asyncBackgroundFinished } = appData.asyncBackGroundInitState

  // Background bch data loaded finished
  const backgroundDataLoaded = bchInitLoaded || asyncBackgroundFinished
  const backgroundDataError = !bchInitLoaded && asyncBackgroundFinished

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title style={{ textAlign: 'center' }}>
            <h2><FontAwesomeIcon icon={faCoins} size='lg' /> Balance</h2>
          </Card.Title>
          <br />

          {bchInitLoaded && (
            <Container>
              <Row>
                <Col>
                  <b>USD</b>: ${usdBalance}
                </Col>
              </Row>

              <Row>
                <Col>
                  <b>BCH</b>: {bchBalance}
                </Col>
              </Row>

              <Row>
                <Col>
                  <b>Satoshis</b>: {sats}
                </Col>
              </Row>
            </Container>)}
          {backgroundDataError && (
            <Container>
              <span style={{ color: 'red' }}>Balance could not be loaded!</span>
            </Container>
          )}

          {!backgroundDataLoaded && (
            <div className='balance-spinner-container'>
              <Spinner animation='border' />
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default BalanceCard
