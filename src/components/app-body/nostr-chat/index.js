/*
  Component for Nostr Chat functionality
*/

// Global npm libraries
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { RelayPool } from 'nostr'

// Local libraries
import ChatSidebar from './chat-sidebar'
import ChatMain from './chat-main'
import config from '../../../config'

function NostrChat (props) {
  const { appData } = props
  const { nostrQueries } = appData
  const [messages, setMessages] = useState([])
  const [loadedMessages, setLoadedMessages] = useState(false)
  const [profiles, setProfiles] = useState({})
  const [channelsData, setChannelsData] = useState({})
  const [channelsLoaded, setChannelsLoaded] = useState(false)
  const [groupChannels] = useState(config.chatsId)
  const [dmChannels, setDmChannels] = useState([])

  const [selectedChannel, setSelectedChannel] = useState(config.chatsId[0])
  const profilesRef = useRef({})

  // Handle read messages
  const onMsgRead = useCallback(async (msg) => {
    try {
      // console.log('onMsgRead() msg: ', msg)

      // Update messages list
      setMessages(current => {
        // ignore existing messages
        const exist = current.find(val => val.id === msg.id)
        if (exist) return current

        const newMsgs = [...current]
        newMsgs.push(msg)

        // Sort messages by timestamp
        newMsgs.sort((a, b) => b.created_at - a.created_at)
        return newMsgs.reverse()
      })

      // Fetch message owner profile
      const pubKey = msg.pubkey
      const existProfile = profilesRef.current[msg.pubkey]
      if (existProfile) {
        return
      }

      console.log(`Trying to get ${pubKey} profile.`)

      const defaultProfile = { name: pubKey } // default profile
      profilesRef.current[pubKey] = defaultProfile // update ref , to prevent fetch this profile again.
      // Fetch profile
      const nostrProfile = await appData.nostrQueries.getProfile(pubKey)

      const profile = nostrProfile || defaultProfile
      const npub = await appData.nostrQueries.hexToNpub(pubKey)
      // add public key formats to profile object
      profile.pubKey = pubKey
      profile.npub = npub
      // Update profiles state
      setProfiles(currentProfiles => {
        const newProfiles = { ...currentProfiles }
        newProfiles[pubKey] = profile
        profilesRef.current = newProfiles
        return newProfiles
      })
    } catch (error) {
      console.warn(error)
    }
  }, [appData, profilesRef])

  // Handle nostr pool
  useEffect(() => {
    // fetch messages when channel selected and channel metadata are loaded
    if (!selectedChannel || !channelsLoaded) return

    const relays = nostrQueries.relays
    if (relays.length === 0) {
      return
    }

    const pool = RelayPool(relays)

    // const pool = RelayPool([config.nostrRelay])
    pool.on('open', relay => {
      relay.subscribe('REQ', { limit: 10, kinds: [42], '#e': [selectedChannel] })
    })

    pool.on('eose', relay => {
      setLoadedMessages(true)
    })

    pool.on('event', (relay, subId, ev) => {
      console.log('post retrieved from ', relay.url, ev.content)
      onMsgRead(ev)
    })

    return () => {
      // Close pool on component unmount or selected channel changes
      console.log('Close existing pool')
      pool.close()
    }
  }, [onMsgRead, selectedChannel, nostrQueries, channelsLoaded])

  // Load channels data
  useEffect(() => {
    const loadChData = async () => {
      const loadedChannels = []
      for (let i = 0; i < groupChannels.length; i++) {
        const ch = groupChannels[i]

        const exist = loadedChannels.find((val) => { return val === ch })
        if (exist) { continue }
        // Fech profile.
        let channelData = await appData.nostrQueries.getChannelInfo(ch)
        console.log('channelData', channelData)
        // Set short id as name
        if (!channelData) channelData = { name: ch.slice(0, 8) + '...' + ch.slice(-5) }
        loadedChannels.push(channelData)

        // Update channels data state
        setChannelsData(currentChs => {
          const newChs = { ...currentChs }
          newChs[ch] = channelData
          return newChs
        })
        setChannelsLoaded(true)
      }
    }

    // loadMessages()
    loadChData()
  }, [selectedChannel, appData, groupChannels])

  const addPrivateMessage = async (profile) => {
    try {
      const exist = dmChannels.find(val => val === profile.pubKey)

      setSelectedChannel(profile.pubKey)
      if (exist) return
      setDmChannels(currentChs => {
        const newChs = [...currentChs]
        newChs.push(profile.pubKey)
        return newChs
      })
      setChannelsData(currentChs => {
        const newChs = { ...currentChs }
        newChs[profile.pubKey] = profile
        return newChs
      })

      setMessages([])

      // setSelectedChannel(profile.pubKey)
    } catch (error) {
      console.warn(error)
    }
  }

  // Reset states on change channel
  const onChangeChannel = useCallback((ch) => {
    if (selectedChannel === ch) return
    setSelectedChannel(ch)
    setMessages([])
    setLoadedMessages(false)
  }, [selectedChannel])

  return (
    <>
      <Container fluid className='h-100 p-0 mb-5 '>
        <Row className='h-100 g-0'>
          <Col xs={12} md={4} lg={3} className='h-100'>
            <ChatSidebar
              groupChannels={groupChannels}
              dmChannels={dmChannels}
              selectedChannel={selectedChannel}
              profiles={profiles}
              channelsData={channelsData}
              onChangeChannel={onChangeChannel}
              {...props}
            />
          </Col>
          <Col xs={12} md={8} lg={9} className='h-100 pe-2'>
            <ChatMain
              loadedMessages={loadedMessages}
              selectedChannel={selectedChannel}
              messages={messages}
              profiles={profiles}
              channelsData={channelsData}
              onChangeChannel={onChangeChannel}
              addPrivateMessage={addPrivateMessage}
              {...props}
            />
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default NostrChat
