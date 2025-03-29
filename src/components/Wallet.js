import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import './Wallet.css';

function Wallet({ user }) {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [balance, setBalance] = useState('0');
  const [isConnected, setIsConnected] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [customToken, setCustomToken] = useState(null);
  const [tokenBalance, setTokenBalance] = useState('0');
  const { t } = useLanguage();

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3();
        setWeb3(web3Instance);
      } catch (error) {
        console.error('Web3 초기화 오류:', error);
        alert('Web3 초기화에 실패했습니다.');
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    const loadWallet = async () => {
      if (user) {
        try {
          const walletDoc = await getDoc(doc(db, 'wallets', user.uid));
          if (walletDoc.exists()) {
            const walletData = walletDoc.data();
            setAccount(walletData.address);
            setPrivateKey(walletData.privateKey);
            setCustomToken(walletData.customToken || null);
            setTokenBalance(walletData.tokenBalance || '0');
            setIsConnected(true);
            
            // ETH 잔액 업데이트
            if (web3) {
              const balance = await web3.eth.getBalance(walletData.address);
              setBalance(web3.utils.fromWei(balance, 'ether'));
            }
          }
        } catch (error) {
          console.error('지갑 로드 오류:', error);
        }
      }
    };

    loadWallet();
  }, [user, web3]);

  const createWallet = async () => {
    if (web3 && user) {
      try {
        const account = web3.eth.accounts.create();
        
        // Firebase에 지갑 정보 저장
        await setDoc(doc(db, 'wallets', user.uid), {
          address: account.address,
          privateKey: account.privateKey,
          createdAt: new Date().toISOString(),
          customToken: null,
          tokenBalance: '0'
        });

        setAccount(account.address);
        setPrivateKey(account.privateKey);
        setIsConnected(true);
        
        const balance = await web3.eth.getBalance(account.address);
        setBalance(web3.utils.fromWei(balance, 'ether'));
      } catch (error) {
        console.error('지갑 생성 오류:', error);
        alert('지갑 생성에 실패했습니다.');
      }
    }
  };

  const addCustomToken = async () => {
    if (!web3 || !account || !user) return;

    try {
      const contractAddress = prompt('토큰 컨트랙트 주소를 입력하세요:');
      if (!contractAddress) return;

      const abi = [
        {
          "constant": true,
          "inputs": [],
          "name": "name",
          "outputs": [{"name": "", "type": "string"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "symbol",
          "outputs": [{"name": "", "type": "string"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "decimals",
          "outputs": [{"name": "", "type": "uint8"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        }
      ];

      const tokenContract = new web3.eth.Contract(abi, contractAddress);
      const tokenName = await tokenContract.methods.name().call();
      const tokenSymbol = await tokenContract.methods.symbol().call();
      const decimals = await tokenContract.methods.decimals().call();
      const balance = await tokenContract.methods.balanceOf(account).call();

      const tokenData = {
        address: contractAddress,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: decimals
      };

      // Firebase에 토큰 정보 저장
      await updateDoc(doc(db, 'wallets', user.uid), {
        customToken: tokenData,
        tokenBalance: web3.utils.fromWei(balance, 'ether')
      });

      setCustomToken(tokenData);
      setTokenBalance(web3.utils.fromWei(balance, 'ether'));
    } catch (error) {
      console.error('토큰 추가 오류:', error);
      alert('토큰 추가에 실패했습니다.');
    }
  };

  const disconnectWallet = async () => {
    if (user) {
      try {
        // Firebase에서 지갑 정보 삭제
        await setDoc(doc(db, 'wallets', user.uid), {
          address: '',
          privateKey: '',
          customToken: null,
          tokenBalance: '0'
        });

        setAccount('');
        setPrivateKey('');
        setBalance('0');
        setCustomToken(null);
        setTokenBalance('0');
        setIsConnected(false);
      } catch (error) {
        console.error('지갑 삭제 오류:', error);
        alert('지갑 삭제에 실패했습니다.');
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
      alert('복사에 실패했습니다.');
    }
  };

  const sendTransaction = async () => {
    if (!web3 || !account || !privateKey) return;

    try {
      const recipient = prompt('받는 주소를 입력하세요:');
      const amount = prompt('보낼 금액을 입력하세요 (ETH):');

      if (!recipient || !amount) return;

      const weiAmount = web3.utils.toWei(amount, 'ether');
      
      const tx = {
        from: account,
        to: recipient,
        value: weiAmount,
        gas: 21000
      };

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      alert('트랜잭션이 성공적으로 전송되었습니다!');
    } catch (error) {
      console.error('트랜잭션 오류:', error);
      alert('트랜잭션 전송에 실패했습니다.');
    }
  };

  return (
    <div className="wallet-container">
      <h3>블록체인 지갑</h3>
      
      {!isConnected ? (
        <button 
          className="connect-button"
          onClick={createWallet}
        >
          새 지갑 생성하기
        </button>
      ) : (
        <div className="wallet-info">
          <div className="account-info">
            <div className="address-container">
              <p>지갑 주소: {account.slice(0, 6)}...{account.slice(-4)}</p>
              <button 
                className="copy-button"
                onClick={() => copyToClipboard(account)}
              >
                {copySuccess ? '복사됨!' : '복사'}
              </button>
            </div>
            <p>ETH 잔액: {balance} ETH</p>
            
            {!customToken ? (
              <button 
                className="add-token-button"
                onClick={addCustomToken}
              >
                커스텀 토큰 추가하기
              </button>
            ) : (
              <div className="token-info">
                <h4>{customToken.name} ({customToken.symbol})</h4>
                <p>잔액: {tokenBalance} {customToken.symbol}</p>
                <p className="token-address">컨트랙트 주소: {customToken.address.slice(0, 6)}...{customToken.address.slice(-4)}</p>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(customToken.address)}
                >
                  {copySuccess ? '복사됨!' : '복사'}
                </button>
              </div>
            )}

            <div className="private-key-container">
              <p className="private-key">개인키: {privateKey.slice(0, 6)}...{privateKey.slice(-4)}</p>
              <button 
                className="copy-button"
                onClick={() => copyToClipboard(privateKey)}
              >
                {copySuccess ? '복사됨!' : '복사'}
              </button>
            </div>
            <p className="warning">⚠️ 개인키는 안전하게 보관하세요!</p>
          </div>
          
          <div className="wallet-actions">
            <button 
              className="send-button"
              onClick={sendTransaction}
            >
              전송하기
            </button>
            <button 
              className="disconnect-button"
              onClick={disconnectWallet}
            >
              지갑 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet; 