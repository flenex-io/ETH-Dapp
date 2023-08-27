
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

import './App.css';

const App = () => {
  const [address, setAddress] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
          const connectedAccounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAccounts(connectedAccounts);
          if (connectedAccounts.length > 0) {
            setAddress(connectedAccounts[0]);
            fetchBalance(connectedAccounts[0]);
          }
        } catch (err) {
          showError('Connection error:', err);
        }
      }
    };
    checkConnection();
  }, []);

  const fetchBalance = async (connectedAccount) => {
    try {
      const provider = new Web3(window.ethereum);
      const balanceWei = await provider.eth.getBalance(connectedAccount);
      const balanceInEther = provider.utils.fromWei(balanceWei, 'ether');
      setBalance(parseFloat(balanceInEther).toFixed(2));
    } catch (error) {
      showError('Error fetching balance:', error);
    }
  };

  const showError = (message, error) => {
    alert(`${message}\n${error.message || error}`);
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const connectedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(connectedAccounts);
        setAddress(connectedAccounts[0]);
        fetchBalance(connectedAccounts[0]);
      } else {
        alert('No wallet detected');
      }
    } catch (err) {
      alert('Connection error:', err);
    }
  };

  const disconnectWallet = () => {
    if (!address) {
      alert('No connected account');
      return;
    }
    setAddress('');
    setAccounts([]);
    setBalance(0);
  };

  const handleSendETH = async (e) => {
  e.preventDefault();

  try {
    if (!window.ethereum) {
      alert('MetaMask not detected');
      return;
    }

    const provider = new Web3(window.ethereum);
    const accounts = await provider.eth.getAccounts();

    if (accounts.length === 0) {
      alert('No connected accounts found');
      return;
    }

    const from = accounts[0];
    const recipientAddress = e.target.to_address.value;
    const amount = e.target.amount.value.toString();

    await provider.eth.sendTransaction({
      from,
      to: recipientAddress,
      value: provider.utils.toWei(amount, 'ether'),
      gasPrice: provider.utils.toWei('10', 'gwei'),
      gas: '21000',
    });

    alert('Transaction sent successfully');
    fetchBalance(from);
  } catch (error) {
    alert('Error sending transaction:', error);
  }
};


  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
          const connectedAccounts = await window.ethereum.request({ method: 'eth_accounts' });
          setAccounts(connectedAccounts);
          if (connectedAccounts.length > 0) {
            setAddress(connectedAccounts[0]);
            fetchBalance(connectedAccounts[0]);
          }
        } catch (err) {
          alert('Connection error:', err);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <div className='App'>
      <header className='App-header'>
        <div className='connect'>
          <button type='button' className='button' onClick={connectWallet}>
            {address
              ? `Connected: ${address.substring(0, 5).toUpperCase()}...${address.substring(38).toUpperCase()}`
              : 'Connect Wallet'}
          </button>
          <button type='button' className='button' onClick={disconnectWallet}>
            Disconnect
          </button>
        </div>

        <div className='center-container'>
          <form onSubmit={handleSendETH}>
            <h3>Enter Address: </h3>
            <input type='text' name='to_address' placeholder='Address: ' />
            <input type='number' name='amount' step={0.001} placeholder='Amount (ETH)' />
            <h5> <span> Balance: </span>  {balance > 0 ? `${balance}` : '0'} ETH</h5>
            <input type='submit' value='Send ETH' />
          </form>
        </div>
      </header>
    </div>
  );
};

export default App;
