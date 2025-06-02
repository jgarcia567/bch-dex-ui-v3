/*
Component for read nostr information.
*/

// Global npm libraries
import React from 'react'
import { Container } from 'react-bootstrap'
import ProfileRead from './profile-read.js'
import PublicRead from './public-read.js'

function NostrRead (props) {
  return (
    <>
      <Container>
        <h2 style={{
          textAlign: 'center',
          margin: '20px 0',
          padding: '10px',
          borderBottom: '2px solid #ccc'
        }}
        >
          Nostr Read
        </h2>
        <ProfileRead {...props} />
        <PublicRead {...props} />
      </Container>
    </>
  )
}

export default NostrRead
