import { useState } from 'react'
import { useQueryParam, StringParam } from 'use-query-params'
<<<<<<< HEAD
import useLocalStorageState from 'use-local-storage-state'
import AppUtil from '../util'

=======
import { useLocation } from 'react-router-dom'
>>>>>>> upstream/master
function useAppState () {
  const location = useLocation()

  // Get the CashStack URL from query parameter or use default
  let [restURL] = useQueryParam('restURL', StringParam)
  if (!restURL) restURL = 'https://free-bch.fullstack.cash'

  const [serverUrl, setServerUrl] = useState(restURL)
  const [menuState, setMenuState] = useState(0)
  const [wallet, setWallet] = useState(false)
  const [servers, setServers] = useState([])

  // Startup state management
  const [asyncInitStarted, setAsyncInitStarted] = useState(false)
  const [asyncInitFinished, setAsyncInitFinished] = useState(false)
  const [asyncInitSucceeded, setAsyncInitSucceeded] = useState(null)

  // Modal state management
  const [showStartModal, setShowStartModal] = useState(true)
  const [modalBody, setModalBody] = useState([])
  const [hideSpinner, setHideSpinner] = useState(false)
  const [denyClose, setDenyClose] = useState(false)

  // The wallet state makes this a true progressive web app (PWA). As
  // balances, UTXOs, and tokens are retrieved, this state is updated.
  // properties are enumerated here for the purpose of documentation.

  // Local storage
  const [lsState, setLSState, { removeItem }] = useLocalStorageState('bchWalletState', {
    ssr: true,
    defaultValue: {}
  })
  console.log('lsState: ', lsState)
  const removeLocalStorageItem = removeItem
  const updateLocalStorage = (lsObj) => {
    // console.log(`updateLocalStorage() input: ${JSON.stringify(lsObj, null, 2)}`)

    // Progressively overwrite the LocalStorage state.
    const newObj = Object.assign({}, lsState, lsObj)
    // console.log(`updateLocalStorage() output: ${JSON.stringify(newObj, null, 2)}`)

    setLSState(newObj)
  }

  const [bchWalletState, setBchWalletState] = useState({
    mnemonic: undefined,
    address: undefined,
    cashAddress: undefined,
    slpAddress: undefined,
    privateKey: undefined,
    publicKey: undefined,
    legacyAddress: undefined,
    hdPath: undefined,
    bchBalance: 0,
    slpTokens: [],
    bchUsdPrice: 150
  })

  // This function is passed to child components in order to update the wallet
  // state. This function is important to make this wallet a PWA.
  function updateBchWalletState (inObj = {}) {
    try {
      const { walletObj, appData } = inObj

      // Debuging
      // console.log('updateBchWalletState() walletObj: ', walletObj)
      // console.log('updateBchWalletState() appData: ', appData)

      appData.setBchWalletState(oldState => {
        const newBchWalletState = Object.assign({}, oldState, walletObj)
        // console.log('newBchWalletState: ', newBchWalletState)

        return newBchWalletState
      })

    // console.log(`New wallet state: ${JSON.stringify(bchWalletState, null, 2)}`)
    } catch (err) {
      console.error('Error in App.js updateBchWalletState()')
      throw err
    }
  }

  return {
    serverUrl,
    setServerUrl,
    menuState,
    setMenuState,
    wallet,
    setWallet,
    servers,
    setServers,
    asyncInitStarted,
    setAsyncInitStarted,
    asyncInitFinished,
    setAsyncInitFinished,
    asyncInitSucceeded,
    setAsyncInitSucceeded,
    showStartModal,
    setShowStartModal,
    modalBody,
    setModalBody,
    hideSpinner,
    setHideSpinner,
    denyClose,
    setDenyClose,
<<<<<<< HEAD
    bchWalletState,
    setBchWalletState,
    lsState,
    setLSState,
    removeLocalStorageItem,
    updateLocalStorage,
    updateBchWalletState,
    appUtil: new AppUtil()
=======
    currentPath: location.pathname

>>>>>>> upstream/master
  }
}

export default useAppState
