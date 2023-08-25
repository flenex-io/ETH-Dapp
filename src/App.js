import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [address, setAddress] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [balance, setBalance] = useState(0);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const connectedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccounts(connectedAccounts);
        setAddress(connectedAccounts[0]);
        fetchBalance(connectedAccounts[0]);
      } catch (err) {
        console.error('Connection error:', err);
      }
    } else {
      alert('No wallet detected');
    }
  };

  const fetchBalance = async (connectedAccount) => {
    try {
      const balance = await window.ethereum.request({ method: 'eth_getBalance', params: [String(connectedAccount), 'latest'] });
      const balanceInEther = parseFloat(balance) / 1e18;
      setBalance(balanceInEther.toFixed(2));
    } catch (error) {
      console.error('Error fetching balance:', error);
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

  const sendTransaction = async (e) => {
    e.preventDefault();

    if(accounts.length === 0){
      alert("No connected account");
      return;
    }

    const toAddress = e.target.to_address.value.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    const transactionParams = {
      from: accounts[0],
      to: toAddress,
      gas: Number(21000).toString(16),
      gasPrice: Number(2500000).toString(16),
      value: Number(1000000000000000).toString(16),
    };

    try {
      const result = await window.ethereum.request({ method: 'eth_sendTransaction', params: [transactionParams] });
      console.log('Transaction result:', result);
    } catch (err) {
      console.error('Transaction error:', err);
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
          console.error('Connection error:', err);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <>
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
        <form onSubmit={sendTransaction}>
          <h3>Enter Address: </h3>
          <input type='text' name='to_address' placeholder='Address: ' />
          <h5> <span> Balance: </span>  {balance > 0 ? `${balance}` : '0'} ETH</h5>
          <input type='submit' value='Submit' />
        </form>
      </div>
    </>
  );
};

export default App;
