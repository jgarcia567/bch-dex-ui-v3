/**
 *  Component for read nostr information kind 1
 */
// Global npm libraries
import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'

import Accordion from 'react-bootstrap/Accordion'

import { RelayPool } from 'nostr'

function PublicRead (props) {
  const { bchWalletState } = props.appData
  const [posts, setPosts] = useState([])
  const [accordionKey, setAccordionKey] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Get Last post from a author
    const start = () => {
      const { nostrKeyPair } = bchWalletState

      const psf = 'wss://nostr-relay.psfoundation.info'

      const pool = RelayPool([psf])
      pool.on('open', relay => {
        relay.subscribe('subid', { limit: 5, kinds: [1], authors: [nostrKeyPair.pubHex] })
      })

      pool.on('eose', relay => {
        console.log('Closing Relay')
        relay.close()
      })

      pool.on('event', (relay, subId, ev) => {
        console.log('Received event:', ev)
        setPosts(currentPosts => [...currentPosts, ev])
      })

      setLoaded(true)
    }

    if (!loaded) {
      start()
    }
  }, [bchWalletState, loaded])

  const handleAccordionChange = (key) => {
    setAccordionKey(key)
  }

  return (
    <Container className='mt-4'>
      <Accordion activeKey={accordionKey} onSelect={handleAccordionChange}>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>Public Post   (  {posts.length} post found  )</Accordion.Header>
          <Accordion.Body style={{ wordBreak: 'break-word' }}>
            {posts.map((post, index) => (
              <div key={index}>
                <span>{post.content}</span>
                <hr />
              </div>
            ))}
            {!posts.length && loaded && (
              <span>Not Post Found!</span>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  )
}

export default PublicRead
