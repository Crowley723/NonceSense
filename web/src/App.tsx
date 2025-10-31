import { useState } from 'react'
import { JsonRpcProvider, Contract } from 'ethers'
import CounterABI from './contracts/Counter.json'
import deployedAddresses from './contracts/deployed_addresses.json'
import './App.css'

const CONTRACT_ADDRESS = deployedAddresses['CounterModule#Counter']

function App() {
  const [contract, setContract] = useState<Contract | null>(null)
  const [counterValue, setCounterValue] = useState<string>('0')
  const [account, setAccount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const connect = async () => {
    try {

      setLoading(true)
      const provider = new JsonRpcProvider('http://127.0.0.1:8545')
      const signer = await provider.getSigner(0) // Uses first test account
      const address = await signer.getAddress()
      setAccount(address)

      const contractInstance = new Contract(CONTRACT_ADDRESS, CounterABI, signer)
      setContract(contractInstance)

      const value = await contractInstance.x()
      setCounterValue(value.toString())
    } catch (error) {
      console.error('Error connecting:', error)
      alert('Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  const readCounter = async () => {
    if (!contract) return

    try {
      setLoading(true)
      const value = await contract.x()
      setCounterValue(value.toString())
    } catch (error) {
      console.error('Error reading counter:', error)
      alert('Failed to read counter value')
    } finally {
      setLoading(false)
    }
  }

  const increment = async () => {
    if (!contract) return

    try {
      setLoading(true)
      const tx = await contract.inc()
      await tx.wait()
      await readCounter()
    } catch (error) {
      console.error('Error incrementing:', error)
      alert('Failed to increment counter')
    } finally {
      setLoading(false)
    }
  }

  const incrementBy = async () => {
    if (!contract) return

    const amount = prompt('Enter amount to increment by:')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid positive number')
      return
    }

    try {
      setLoading(true)
      const tx = await contract.incBy(Number(amount))
      await tx.wait()
      await readCounter()
    } catch (error) {
      console.error('Error incrementing by amount:', error)
      alert('Failed to increment counter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <h1>Counter DApp</h1>
      <p>Blockchain-based counter using smart contracts</p>

      {!account ? (
        <div className="card">
          <button onClick={connect} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <p>Connect your wallet to interact with the contract</p>
        </div>
      ) : (
        <>
          <div className="card">
            <p><strong>Connected Account:</strong></p>
            <p style={{ fontSize: '0.9em', wordBreak: 'break-all' }}>{account}</p>
          </div>

          <div className="card">
            <h2>Counter Value: {counterValue}</h2>
            <button onClick={readCounter} disabled={loading}>
              Refresh Counter
            </button>
          </div>

          <div className="card">
            <button onClick={increment} disabled={loading}>
              Increment by 1
            </button>
            <button onClick={incrementBy} disabled={loading}>
              Increment by Amount
            </button>
          </div>

          {loading && <p>Processing transaction...</p>}
        </>
      )}
    </div>
  )
}

export default App
