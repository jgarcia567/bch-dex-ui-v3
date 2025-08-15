/*
  Component for reading the nostr feeds.
*/

// Global npm libraries
import React, { useState, useEffect, useCallback } from 'react'
import { Container, Nav, Tab, Spinner } from 'react-bootstrap'
import { RelayPool } from 'nostr'

// Local libraries
import Feed from './feed'
import Following from './following'
import config from '../../../../config'

function Feeds (props) {
  const { appData } = props
  const [activeTab, setActiveTab] = useState(appData.lastFeedTab)

  const [posts, setPosts] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [profiles, setProfiles] = useState({})

  // Load profile from nostr relays
  // It uses multiple relays. It will exit after the first successful retrieval
  // from any relay. If one relay fails, it will move on to the next one.
  const fetchProfile = useCallback(async (pubKey) => {
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

  // Get array of feeds from relays
  const fetchFeeds = useCallback(async () => {
    let feeds = await new Promise((resolve, reject) => {
      let list = []
      let closedRelays = 0

      const pool = RelayPool(config.nostrRelays)
      // const pool = RelayPool([config.nostrRelay])
      pool.on('open', relay => {
        relay.subscribe('REQ', { limit: 10, kinds: [1], '#t': ['slpdex-socialmedia'] })
      })

      pool.on('eose', relay => {
        relay.close()
        closedRelays++
        // Resolve list if all relays are closed
        if (closedRelays === config.nostrRelays.length) {
          resolve(list)
        }
      })

      pool.on('event', (relay, subId, ev) => {
        // console.log('post retrieved from ', relay.url, ev.sig)
        list = [...list, ev]
      })
    })

    // Remove duplicated feeds
    feeds = feeds.filter((val, i, list) => {
      const existingIndex = list.findIndex(value => value.id === val.id)
      return existingIndex === i
    })

    // Sort from newest to oldest
    feeds.sort((a, b) => b.created_at - a.created_at)

    // console.log('feeds', feeds)

    setPosts(feeds)
    return feeds
  }, [])

  // Load data on component mount.
  useEffect(() => {
    const loadData = async () => {
      // Get feeds
      const feeds = await fetchFeeds()
      setLoaded(true)

      const loadedProfiles = [] // fetched profiles ( this will be used for prevent load the same profile multiple times.)
      // Map feeds and get feed owner profile.
      for (let i = 0; i < feeds.length; i++) {
        const pubKey = feeds[i].pubkey

        const exist = loadedProfiles.find((val) => { return val === pubKey })
        if (exist) { continue }
        // Fech profile.
        const profile = await fetchProfile(pubKey)
        loadedProfiles.push(pubKey) // mark as loaded

        // Update profile state
        setProfiles(currentProfiles => {
          const newProfiles = { ...currentProfiles }
          newProfiles[pubKey] = profile
          return newProfiles
        })
      }
    }
    if (!loaded) {
      loadData()
    }
  }, [loaded, fetchFeeds, fetchProfile])

  const onChangeTab = (tab) => {
    setActiveTab(tab)
    appData.setLastFeedTab(tab)
    appData.updateLocalStorage({ lastFeedTab: tab })
  }

  return (
    <>
      <Container>
        <h2 style={{
          textAlign: 'center',
          margin: '20px 0 30px 0',
          padding: '10px',
          borderBottom: '2px solid #ccc'
        }}
        >
          Feeds
        </h2>

        {loaded && (
          <Tab.Container activeKey={activeTab} onSelect={onChangeTab}>
            <Nav variant='tabs' className='mb-4'>
              <Nav.Item>
                <Nav.Link eventKey='feed' className={activeTab === 'feed' ? 'active' : ''}>
                  Feeds
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey='following' className={activeTab === 'following' ? 'active' : ''}>
                  Following
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey='feed'>
                <Feed appData={appData} posts={posts} profiles={profiles} />
              </Tab.Pane>
              <Tab.Pane eventKey='following'>
                <Following appData={appData} posts={posts} profiles={profiles} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        )}

        {!loaded && (
          <div className='text-center text-muted py-5 bg-light rounded-4 shadow-sm'>
            <Spinner animation='border' />
          </div>
        )}
      </Container>
    </>
  )
}

export default Feeds
