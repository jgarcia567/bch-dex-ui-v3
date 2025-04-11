/*
  This component renders as a button. When clicked, it opens a modal that
  displays information about the token.

  This is a functional component with as little state as possible.
*/

// Global npm libraries
import React, { useState } from 'react'
import { Button, Modal, Container, Row, Col } from 'react-bootstrap'

function InfoButton (props) {
  const [show, setShow] = useState(false)

  const handleClose = () => {
    console.log('handleClose()')
    setShow(false)
    // props.instance.setState({ showModal: false })
  }

  const handleOpen = () => {
    console.log('handleOpen()')
    setShow(true)
  }

  // Replace with dummy button until token data is loaded.
  if (!props.token.tokenData) {
    return (
      <>
        <Button variant='info'>Info</Button>
      </>
    )
  }

  return (
    <>
      <Button variant='info' disabled={props.disabled} onClick={handleOpen}>Info</Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Token Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col xs={4}><b>Ticker</b>:</Col>
              <Col xs={8}>{props.token.ticker}</Col>
            </Row>

            <Row style={{ backgroundColor: '#eee' }}>
              <Col xs={4}><b>Name</b>:</Col>
              <Col xs={8}>{props.token.tokenData.genesisData.name}</Col>
            </Row>

            <Row>
              <Col xs={4}><b>Token ID</b>:</Col>
              <Col xs={8} style={{ wordBreak: 'break-all' }}>
                <a href={`https://explorer.tokentiger.com/?tokenid=${props.token.tokenId}`} target='_blank' rel='noreferrer'>
                  {props.token.tokenId}
                </a>
              </Col>
            </Row>

            <Row style={{ backgroundColor: '#eee' }}>
              <Col xs={4}><b>Decimals</b>:</Col>
              <Col xs={8}>{props.token.tokenData.genesisData.decimals}</Col>
            </Row>

            <Row>
              <Col xs={4}><b>Token Type</b>:</Col>
              <Col xs={8}>{props.token.tokenType}</Col>
            </Row>

          </Container>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    </>
  )
}

export default InfoButton
