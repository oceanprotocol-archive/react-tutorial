import React, { useState } from 'react'
import * as Assets from './asset'

export default function Compute({ ocean, web3 }) {
  const [ddoAsset, setDdoAsset] = useState({ id: '' })
  const [jobStatus, setJobStatus] = useState('')
  const [jobId, setJobId] = useState('')
  const [agreementId, setAgreementId] = useState('')
  const [ddoAlgorithm, setDdoAlgorithm] = useState({ id: '' })

  // publish a dataset and an algorithm
  async function publish() {
    try {
      const accounts = await ocean.accounts.list()
      console.log('Publishing asset.')

      const service = await Assets.createComputeService(
        ocean,
        accounts[0],
        '0',
        '2020-03-10T10:00:00Z'
      )
      console.log(service)
      const ddoAssetNew = await ocean.assets.create(
        Assets.getAsset(),
        accounts[0],
        [service]
      )
      console.log('Asset successfully submitted.')
      console.log(ddoAssetNew)
      // keep track of this registered asset for consumption later on
      setDdoAsset(ddoAssetNew)
      alert('Asset successfully submitted.')
    } catch (error) {
      console.error(error.message)
    }
  }

  async function publishalgo() {
    try {
      const accounts = await ocean.accounts.list()
      console.log('Publishing algo.')

      const ddoAlgorithmNew = await ocean.assets.create(
        Assets.getAlgoAsset(),
        accounts[0]
      )
      console.log(ddoAlgorithmNew)
      console.log('Algo asset successfully submitted.')
      // keep track of this registered asset for consumption later on
      setDdoAlgorithm(ddoAlgorithmNew)
      alert('Algorithm successfully submitted.')
    } catch (error) {
      console.error(error.message)
    }
  }

  // order and start the compute service
  async function start() {
    try {
      const accounts = await ocean.accounts.list()

      // order the compute service
      const agreement = await ocean.compute.order(accounts[0], ddoAsset.id)
      setAgreementId(agreement)
      // start a compute job
      const status = await ocean.compute.start(
        accounts[0],
        agreement,
        ddoAlgorithm.id
      )
      setJobId(status.jobId)
      console.log(status)
      alert('Job created.  You can query for status now')
    } catch (error) {
      console.error(error.message)
    }
  }

  async function getStatus() {
    try {
      const accounts = await ocean.accounts.list()
      // start a compute job

      const status = await ocean.compute.status(accounts[0], agreementId, jobId)
      setJobStatus(JSON.stringify(status, null, '\t'))
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
        1) Publish dataset with compute service
      </button>
      <button onClick={() => publishalgo()} disabled={!web3}>
        2) Publish algorithm
      </button>
      <button onClick={() => start()} disabled={!web3}>
        3)Order and start compute service
      </button>
      <button onClick={() => getStatus()} disabled={!web3}>
        4)Get Job Status
      </button>
      <hr />
      Asset DID:
      <input type="text" value={ddoAsset.id} readOnly />
      <hr />
      Algo DID:
      <input type="text" value={ddoAlgorithm.id} readOnly />
      <hr />
      Job ID:
      <input type="text" value={jobId} readOnly />
      <hr />
      Compute status:
      <textarea rows="10" cols="180" value={jobStatus} readOnly />
    </>
  )
}
