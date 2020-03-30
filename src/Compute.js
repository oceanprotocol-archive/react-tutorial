import React, { useState } from 'react'

import asset from './asset'
import { assetAlgo, createComputeService, rawAlgoMeta } from './asset-compute'

export default function Compute({ ocean, web3 }) {
  const [ddoAssetId, setDdoAssetId] = useState('')
  const [jobStatus, setJobStatus] = useState('')
  const [jobId, setJobId] = useState('')
  const [agreementId, setAgreementId] = useState('')
  const [ddoAlgorithmId, setDdoAlgorithmId] = useState('')
  const [isAlgoInputVisible, setIsAlgoInputVisible] = useState('')
  const [textRawAlgo, setTextRawAlgo] = useState('')
  const [publishLogState, setPublishLogState] = useState(false)
  const [publishOutputState, setPublishOutputState] = useState(false)

  // publish a dataset and an algorithm
  async function publish() {
    try {
      const accounts = await ocean.accounts.list()
      console.log('Publishing asset.')

      const service = await createComputeService(
        ocean,
        accounts[0],
        '0',
        '2020-03-10T10:00:00Z'
      )
      console.log(service)
      const ddoAssetNew = await ocean.assets.create(asset, accounts[0], [
        service
      ])
      console.log('Asset successfully submitted.')
      console.log(ddoAssetNew)
      // keep track of this registered asset for consumption later on
      setDdoAssetId(ddoAssetNew.id)
      alert('Asset successfully submitted.')
    } catch (error) {
      console.error(error.message)
    }
  }

  async function publishalgo() {
    try {
      const accounts = await ocean.accounts.list()
      console.log('Publishing algo.')

      const ddoAlgorithmNew = await ocean.assets.create(assetAlgo, accounts[0])
      console.log(ddoAlgorithmNew)
      console.log('Algo asset successfully submitted.')
      // keep track of this registered asset for consumption later on
      setDdoAlgorithmId(ddoAlgorithmNew.id)
      alert('Algorithm successfully submitted.')
    } catch (error) {
      console.error(error.message)
    }
  }

  async function startCompute(algorithmId, algorithmMeta) {
    try {
      const accounts = await ocean.accounts.list()
      const computeOutput = {
        publishAlgorithmLog: publishLogState,
        publishOutput: publishOutputState,
        brizoAddress: ocean.config.brizoAddress,
        brizoUri: ocean.config.brizoUri,
        metadataUri: ocean.config.aquariusUri,
        nodeUri: ocean.config.nodeUri,
        owner: accounts[0].getId(),
        secretStoreUri: ocean.config.secretStoreUri
      }
      console.log(computeOutput)
      // order the compute service
      const agreement = await ocean.compute.order(accounts[0], ddoAssetId)
      setAgreementId(agreement)
      // start a compute job
      const status = await ocean.compute.start(
        accounts[0],
        agreement,
        algorithmId,
        encodeURIComponent(JSON.stringify(algorithmMeta)),
        computeOutput
      )
      setJobId(status.jobId)
      console.log(status)
      alert('Compute job created. You can query for its status now.')
    } catch (error) {
      console.error(error.message)
    }
  }

  // order and start the compute service with an algorithm published as an asset
  async function startWithPublishedAlgo() {
    return startCompute(ddoAlgorithmId)
  }

  // order and start the compute service with a passed raw algorithm
  async function startWithRawAlgo() {
    rawAlgoMeta.rawcode = textRawAlgo
    return startCompute(undefined, rawAlgoMeta)
  }

  async function getStatus() {
    try {
      const accounts = await ocean.accounts.list()

      const status = await ocean.compute.status(accounts[0], agreementId, jobId)
      setJobStatus(JSON.stringify(status, null, '\t'))
      console.log(status)
    } catch (error) {
      console.error(error.message)
    }
  }

  async function showDivAlgo() {
    setIsAlgoInputVisible(isAlgoInputVisible ? false : true)
  }

  async function updateRawAlgoCode(event) {
    setTextRawAlgo(event.target.value)
  }

  async function updateDdoAssetId(event) {
    setDdoAssetId(event.target.value)
  }

  async function handlePublishOutputState(event) {
    setPublishOutputState(event.target.checked)
  }

  async function handlePublishLogState(event) {
    setPublishLogState(event.target.checked)
  }

  if (!web3) {
    return null
  }

  return (
    <>
      <h2>Compute</h2>
      <ComputeSection>
        <h3>1. Publish Dataset</h3>
        <button onClick={publish}>Publish dataset with compute service</button>

        <p>
          <Label htmlFor="ddoAssetId">Asset DID</Label>
          <input
            type="text"
            id="ddoAssetId"
            value={ddoAssetId}
            onChange={updateDdoAssetId}
          />
        </p>
      </ComputeSection>

      <ComputeSection>
        <h3>2. Publish Algorithm</h3>
        <button onClick={publishalgo}>Publish algorithm</button>
        <p>
          <Label htmlFor="ddoAlgorithmId">Algorithm DID</Label>
          <code id="ddoAlgorithmId">{ddoAlgorithmId}</code>
        </p>
      </ComputeSection>

      <ComputeSection>
        <h3>3. Start Compute Job</h3>

        <p>
          <Label htmlFor="publishOutputState">
            <input
              type="checkbox"
              id="publishOutputState"
              checked={publishOutputState}
              onChange={handlePublishOutputState}
            />
            Publish Output into the Marketplace
          </Label>
          <Label htmlFor="publishLogState">
            <input
              type="checkbox"
              id="publishLogState"
              checked={publishLogState}
              onChange={handlePublishLogState}
            />
            Publish Algorithm Logs into the Marketplace
          </Label>
        </p>

        <div>
          <button onClick={showDivAlgo}>Show/Hide Raw Algorithm</button>
          <p style={{ display: isAlgoInputVisible ? 'block' : 'none' }}>
            <Label htmlFor="jobStatus">Raw Algorithm</Label>
            <textarea
              style={{ width: '100%' }}
              rows="10"
              value={textRawAlgo}
              onChange={updateRawAlgoCode}
            />
          </p>
        </div>

        <p>
          <Label htmlFor="jobId">Compute Job ID</Label>
          <code>{jobId}</code>
        </p>

        <button
          onClick={startWithPublishedAlgo}
          disabled={!ddoAssetId || !ddoAlgorithmId}
        >
          Order and start compute service with published algorithm
        </button>
        <button onClick={startWithRawAlgo} disabled={!ddoAssetId}>
          Order and start compute service with raw algorithm
        </button>
      </ComputeSection>

      <ComputeSection>
        <h3>4. Get Compute Job Status</h3>

        <pre
          id="jobStatus"
          style={{ padding: '1rem', background: 'ghostwhite' }}
        >
          <code>{jobStatus}</code>
        </pre>

        <button onClick={getStatus} disabled={!jobId}>
          Get Job Status
        </button>
      </ComputeSection>
    </>
  )
}

function ComputeSection({ children }) {
  return (
    <>
      <div
        style={{
          textAlign: 'left',
          paddingBottom: '1rem',
          maxWidth: '40rem',
          margin: '1rem auto'
        }}
      >
        {children}
      </div>
      <hr />
    </>
  )
}

function Label({ children, ...props }) {
  return (
    <label style={{ display: 'block', fontSize: '0.8rem' }} {...props}>
      {children}
    </label>
  )
}
