import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Ocean } from '@oceanprotocol/squid'
import Web3 from 'web3'
import asset from './asset'
import Compute from './Compute'

let web3

if (window.web3) {
  web3 = new Web3(window.web3.currentProvider)
  window.ethereum.enable()
}

class App extends Component {
  state = {
    ocean: undefined,
    results: [],
    ddo: undefined
  }

  async componentDidMount() {
    const ocean = await new Ocean.getInstance({
      web3Provider: web3,
      nodeUri: 'https://nile.dev-ocean.com',
      aquariusUri: 'https://aquarius.marketplace.dev-ocean.com',
      brizoUri: 'https://brizo.marketplace.dev-ocean.com',
      brizoAddress: '0x4aaab179035dc57b35e2ce066919048686f82972',
      secretStoreUri: 'https://secret-store.nile.dev-ocean.com',
      // local Spree connection
      // nodeUri: 'http://localhost:8545',
      // aquariusUri: 'http://aquarius:5000',
      // brizoUri: 'http://localhost:8030',
      // brizoAddress: '0x00bd138abd70e2f00903268f3db08f2d25677c9e',
      // secretStoreUri: 'http://localhost:12001',
      verbose: true
    })
    this.setState({ ocean })
    console.log('Finished loading contracts.')
  }

  async registerAsset() {
    try {
      const accounts = await this.state.ocean.accounts.list()
      const ddo = await this.state.ocean.assets.create(asset, accounts[0])
      console.log('Asset successfully submitted.')
      console.log(ddo)
      // keep track of this registered asset for consumption later on
      this.setState({ ddo })
      alert(
        'Asset successfully submitted. Look into your console to see the response DDO object.'
      )
    } catch (error) {
      console.error(error.message)
    }
  }

  async searchAssets() {
    try {
      const search = await this.state.ocean.assets.search(
        '10 Monkey Species Small'
      )
      this.setState({ results: search.results })
      console.log(search)
      alert(
        'Asset successfully retrieved. Look into your console to see the search response.'
      )
    } catch (error) {
      console.error(error.message)
    }
  }

  async consumeAsset() {
    try {
      // get all accounts
      const accounts = await this.state.ocean.accounts.list()
      // get our registered asset
      const consumeAsset = this.state.ddo
      // order service agreement
      const agreement = await this.state.ocean.assets.order(
        consumeAsset.id,
        accounts[0]
      )
      // consume it
      await this.state.ocean.assets.consume(
        agreement,
        consumeAsset.id,
        accounts[0],
        '',
        0
      )
    } catch (error) {
      console.error(error.message)
    }
  }

  render() {
    return (
      <div
        style={{ fontFamily: '"Fira Code", monospace', textAlign: 'center' }}
      >
        <h1>
          <span role="img" aria-label="squid">
            🦑
          </span>
          <br /> My Little Ocean
        </h1>

        {!web3 && <p>No Web3 Browser!</p>}

        <button onClick={() => this.registerAsset()} disabled={!web3}>
          Register asset
        </button>
        <hr />
        <button onClick={() => this.searchAssets()}>Search assets</button>
        <button onClick={() => this.consumeAsset()} disabled={!web3}>
          Consume asset
        </button>
        <hr />
        <Compute ocean={this.state.ocean} web3={web3} />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
