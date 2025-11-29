/*
  This component renders as a button. When clicked, it opens a modal that
  cancels the counter offer.

  This is a functional component with as little state as possible.
*/

// Global npm libraries
import React, { useState } from 'react'
import { Button, Modal, Container, Row, Col, Spinner } from 'react-bootstrap'
import Sweeper from 'bch-token-sweep'

function CancelCounterOfferBtn (props) {
  const [show, setShow] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [hideSpinner, setHideSpinner] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Update wallet state function
  const updateWalletState = async () => {
    const wallet = props.appData.wallet
    const bchBalance = await wallet.getBalance({ bchAddress: wallet.walletInfo.cashAddress })
    await wallet.initialize()
    const slpTokens = await wallet.listTokens(wallet.walletInfo.cashAddress)
    props.appData.updateBchWalletState({ walletObj: { bchBalance, slpTokens }, appData: props.appData })
  }

  // Handle cancel/sweep function
  const handleCancel = async () => {
    try {
      console.log('Canceling Counter Offer')

      // Set modal initial state
      setShow(true)
      setHideSpinner(false)
      setStatusMsg('')
      setIsProcessing(true)

      // Get the keypair that holds Counter Offer UTXOs.
      // This uses the same derivation path as used in the counter offers page (index 1)
      const bchDexLib = props.appData.dexLib
      const keyPair = await bchDexLib.take.util.getKeyPair(1)
      const wif = keyPair.wif

      // Get wallet info for sweeping
      const walletWif = props.appData.wallet.walletInfo.privateKey
      const toAddr = props.appData.wallet.slpAddress

      // Instance the Sweep library and populate UTXOs from network
      const sweep = new Sweeper(wif, walletWif, props.appData.wallet)
      await sweep.populateObjectFromNetwork()

      // Constructing the sweep transaction
      const hex = await sweep.sweepTo(toAddr)
      const txid = await props.appData.wallet.ar.sendTx(hex)

      // Generate success status message
      const newStatusMsg = (
        <>
          <p>Sweep succeeded!</p>
          <p>Counter Offer has been canceled.</p>
          <p>Transaction ID: {txid}</p>
          <p>
            <a href={`https://blockchair.com/bitcoin-cash/transaction/${txid}`} target='_blank' rel='noreferrer'>
              TX on Blockchair BCH Block Explorer
            </a>
          </p>
          <p>
            <a href={`https://token.fullstack.cash/transactions/?txid=${txid}`} target='_blank' rel='noreferrer'>
              TX on token explorer
            </a>
          </p>
        </>
      )

      setHideSpinner(true)
      setStatusMsg(newStatusMsg)
      setIsProcessing(false)

      // Update wallet state to reflect the changes
      await updateWalletState()

      // Refresh the counter offers list if refreshTokens function is provided
      if (props.refreshTokens) {
        // Small delay to ensure blockchain state is updated
        setTimeout(() => {
          props.refreshTokens()
        }, 2000)
      }
    } catch (err) {
      console.error('Error in handleCancel(): ', err)
      setHideSpinner(true)
      setIsProcessing(false)
      setStatusMsg(<b style={{ color: 'red' }}>{`Error: ${err.message}`}</b>)
    }
  }

  const handleClose = () => {
    setShow(false)
    setStatusMsg('')
    setHideSpinner(false)
    setIsProcessing(false)
  }

  const handleOpen = () => {
    setShow(true)
    handleCancel() // Automatically start the cancel process when modal opens
  }

  return (
    <>
      <Button variant='danger' onClick={handleOpen} disabled={isProcessing}>Cancel</Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Counter Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              {!hideSpinner && (
                <Col style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px' }}>Canceling Counter Offer...</span>
                  <Spinner animation='border' />
                </Col>
              )}
            </Row>
            <br />
            {statusMsg && (
              <Row>
                <Col style={{ textAlign: 'center' }}>{statusMsg}</Col>
              </Row>
            )}
          </Container>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    </>
  )
}

export default CancelCounterOfferBtn
