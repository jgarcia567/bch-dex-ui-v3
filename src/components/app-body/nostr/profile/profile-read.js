/**
 * Component to read nostr information kind 0 (normal posts)
 *
 */

// Global npm libraries
import React, { useEffect, useState, useCallback } from 'react'
import { Container, Button } from 'react-bootstrap'
import CopyOnClick from '../../bch-wallet/copy-on-click.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGlobe } from '@fortawesome/free-solid-svg-icons'
import * as nip19 from 'nostr-tools/nip19'

// Local libraries
import config from '../../../../config'
import NostrFormat from '../nostr-format'
import { RelayPool } from 'nostr'

function ProfileRead (props) {
  const { npub } = props
  const { onProfileRead } = props
  const [profile, setProfile] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [imageError, setImageError] = useState({ picture: false, banner: false })

  // Load profile from nostr relays
  // It uses multiple relays. It will exit after the first successful retrieval
  // from any relay. If one relay fails, it will move on to the next one.
  const fetchProfile = useCallback(async (pubKey) => {
    console.log('fetching profile for pubkey ', pubKey)
    // Looking for the profile in each relay sequentially
    for (let i = 0; i < config.nostrRelays.length; i++) {
      const profile = await new Promise((resolve) => {
        const relay = config.nostrRelays[i]
        // const pool = RelayPool(config.nostrRelays)
        const pool = RelayPool([relay])
        pool.on('open', relay => {
          relay.subscribe('subid', { limit: 5, kinds: [0], authors: [pubKey] })
        })

        pool.on('eose', relay => {
          console.log('Closing Relay')
          relay.close()
          resolve(false)
        })

        pool.on('event', (relay, subId, ev) => {
          try {
            const profile = JSON.parse(ev.content)
            // console.log('profile', profile)
            console.log(`Profile found  for ${pubKey} at ${relay.url}`)
            resolve(profile)
          } catch (error) {
            resolve(false)
          }
          relay.close()
        })
      })
      // Stop looking for profile if found
      if (profile) {
        return profile
      }
    }
  }, [])

  useEffect(() => {
    const start = async () => {
      const pubHexData = nip19.decode(npub)
      const pubHex = pubHexData.data

      const profile = await fetchProfile(pubHex)
      onProfileRead(profile)
      setProfile(profile)
      setLoaded(true)
    }

    if (!loaded && npub) {
      start()
    }
  }, [loaded, onProfileRead, npub, fetchProfile])

  const handleImageError = (type) => {
    setImageError(prev => ({ ...prev, [type]: true }))
  }

  const handleImageLoad = (type) => {
    setImageError(prev => ({ ...prev, [type]: false }))
  }

  return (
    <Container>
      {/* Banner Section */}
      {profile.banner && !imageError.banner && (
        <div className='position-relative'>
          <img
            src={profile.banner}
            alt='Profile banner'
            className='w-100 rounded-4 shadow-sm'
            style={{ height: '200px', objectFit: 'cover' }}
            onError={() => handleImageError('banner')}
            onLoad={() => handleImageLoad('banner')}
          />
        </div>
      )}

      <div className='d-flex flex-column flex-md-row align-items-center gap-4 mb-5 p-3 p-md-5 bg-light rounded-4 shadow-sm'>
        {/* Profile Picture */}
        <div style={{ width: '120px', height: '120px' }} className='mb-3 mb-md-0'>
          {profile.picture && !imageError.picture
            ? (
              <img
                src={profile.picture}
                alt='Profile'
                className='rounded-circle shadow w-100 h-100'
                style={{ objectFit: 'cover' }}
                onError={() => handleImageError('picture')}
                onLoad={() => handleImageLoad('picture')}
              />
              )
            : (
              <div
                className='rounded-circle bg-gradient shadow d-flex align-items-center justify-content-center'
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(45deg, #6c757d, #495057)'
                }}
              >
                <FontAwesomeIcon icon={faUser} size='3x' color='#7c7c7d' />
              </div>
              )}
        </div>

        {/* Profile Information */}
        <div className='flex-grow-1 text-center text-md-start mb-3 mb-md-0 d-flex flex-column align-items-center align-items-md-start'>
          <h3 className='mb-2 fw-bold'>{profile.name || 'username'}</h3>

          <div className='text-muted small mb-3 d-flex align-items-center flex-column flex-md-row'>
            <span className='text-truncate me-2 mb-2 mb-md-0'>
              <span className='d-md-none'>
                {`${npub?.slice(0, 8)}...${npub?.slice(-5)}`}
              </span>
              <span className='d-none d-md-inline'>
                {npub}
              </span>
            </span>
            <CopyOnClick walletProp='npub' appData={props.appData} value={npub} />
          </div>

          {/* About Section */}
          {profile.about && (
            <div className='fs-6 text-secondary'>
              <NostrFormat content={profile.about} />
            </div>
          )}

          {/* Website Link */}
          {profile.website && (
            <div className='mb-3 d-flex align-items-center gap-2'>
              <FontAwesomeIcon icon={faGlobe} className='text-muted' size='sm' />
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target='_blank'
                rel='noopener noreferrer'
                className='text-decoration-none text-muted small'
                style={{ wordBreak: 'break-all' }}
              >
                {profile.website}
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className='d-flex gap-2 align-items-center flex-wrap justify-content-center'>
          <Button
            variant='outline-danger'
            className='px-3 px-md-4 py-2 rounded-pill fw-semibold'
            style={{ minWidth: '120px' }}
          >
            <i className='bi bi-person-plus me-2' />
            Follow
          </Button>
          <Button
            variant='primary'
            className='px-3 px-md-4 py-2 rounded-pill fw-semibold'
            style={{ minWidth: '120px' }}
          >
            <i className='bi bi-chat-dots me-2' />
            Message
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default ProfileRead
