/*
  This Card component displays a counter offer with token icon, name, and price.
*/

// Global npm libraries
import React, { useState } from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import Jdenticon from '@chris.troutner/react-jdenticon'

function CounterOfferCard (props) {
  const { offer } = props
  const [icon, setIcon] = useState(offer.tokenIcon)

  return (
    <>
      <Col xs={12} sm={6} lg={4} style={{ padding: '25px' }}>
        <Card className='shadow-sm'>
          <Card.Body style={{ textAlign: 'center', padding: '10px' }}>
            {/** If the icon is loaded, display it */}
            {icon && (
              <Card.Img
                src={icon}
                style={{ height: '100px', width: 'auto', margin: '0 auto' }}
                onError={(e) => {
                  setIcon(null) // Set the icon to null if it fails to load the image url.
                }}
              />
            )}

            {/** If the icon is not loaded, display the Jdenticon */}
            {!icon && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <Jdenticon size='100' value={offer.tokenId} />
              </div>
            )}

            <Card.Title style={{ textAlign: 'center', marginTop: '10px' }}>
              <h4>{offer.ticker}</h4>
            </Card.Title>

            <Container>
              <Row>
                <Col>
                  {/* <strong>{offer.tokenName}</strong> */}
                  <strong>Counter Offer UTXO</strong>
                </Col>
              </Row>
              <br />

              <Row>
                {/* <Col>Price:</Col> */}
                <Col><strong>{offer.price}</strong></Col>
              </Row>
              <br />

              <Row className='text-center'>
                <Col>
                  <Button disabled variant='danger' size='sm'>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Container>
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default CounterOfferCard
