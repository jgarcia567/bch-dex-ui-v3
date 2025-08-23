/*
 This component is a View that allows the user to handle configuration
 settings for the app.
*/

// Global npm libraries
import React from 'react'
import ServerSelectView from './select-server-view'
import RelaySelectionView from './relay-selection-view'

function ConfigurationView (props) {
  const { appData } = props

  return (
    <>
      <ServerSelectView appData={appData} />
      <RelaySelectionView appData={appData} />
    </>
  )
}

export default ConfigurationView
