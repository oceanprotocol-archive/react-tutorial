import React, { useState } from 'react'
import asset from './asset'

export default function Compute({ ocean, web3 }) {
  const [ddoAsset, setDdoAsset] = useState('')
  const [ddoAlgorithm, setDdoAlgorithm] = useState('')

  // publish a dataset and an algorithm
  async function publish() {
    try {
      const accounts = await ocean.accounts.list()
      const ddoAssetNew = await ocean.assets.create(asset, accounts[0])
      const ddoAlgorithmNew = await ocean.assets.create(asset, accounts[0])

      console.log('Asset successfully submitted.')
      console.log(ddoAssetNew)
      console.log(ddoAlgorithmNew)
      // keep track of this registered asset for consumption later on
      setDdoAsset(ddoAssetNew)
      setDdoAlgorithm(ddoAlgorithmNew)
      alert(
        'Asset successfully submitted. Look into your console to see the response DDO object.'
      )
    } catch (error) {
      console.error(error.message)
    }
  }

  // order and start the compute service
  async function start() {
    try {
      const accounts = await ocean.accounts.list()

      // order the compute service
      const agreementId = await ocean.compute.order(accounts[0], ddoAsset.id)

      // start a compute job
      const status = await ocean.compute.start(
        accounts[0],
        agreementId,
        ddoAlgorithm.id
      )
      console.log(status)
    } catch (error) {
      console.error(error.message)
    }
  }

  // get results

  return (
    <>
      <h3>Compute</h3>
      <button onClick={() => publish()} disabled={!web3}>
        Publish dataset and algorithm
      </button>
      <button onClick={() => start()} disabled={!web3}>
        Order and start compute service
      </button>
    </>
  )
}
