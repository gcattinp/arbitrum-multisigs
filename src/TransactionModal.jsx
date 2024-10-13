import React, { useState, useEffect, useCallback } from 'react';

const truncateAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

const TransactionModal = ({ safeAddress, safeLabel, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [allSigners, setAllSigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const txResponse = await fetch(`https://safe-transaction-arbitrum.safe.global/api/v1/safes/${safeAddress}/multisig-transactions/`);
        if (!txResponse.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const txData = await txResponse.json();
        setTransactions(txData.results);

        // Fetch all signers (owners) of the safe
        const ownersResponse = await fetch(`https://safe-transaction-arbitrum.safe.global/api/v1/safes/${safeAddress}/`);
        if (!ownersResponse.ok) {
          throw new Error('Failed to fetch safe owners');
        }
        const ownersData = await ownersResponse.json();
        setAllSigners(ownersData.owners);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [safeAddress]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  }, [onClose]);

  const generateSignerParticipationTable = () => {
    if (transactions.length === 0 || allSigners.length === 0) return null;

    const nonces = transactions.map(tx => tx.nonce).sort((a, b) => a - b);

    return (
      <table className="signer-participation-table">
        <thead>
          <tr>
            <th>Signer</th>
            {nonces.map(nonce => (
              <th key={nonce}>{nonce}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allSigners.map(signer => (
            <tr key={signer}>
              <td>{truncateAddress(signer)}</td>
              {nonces.map(nonce => {
                const tx = transactions.find(t => t.nonce === nonce);
                const signed = tx?.confirmations.some(conf => conf.owner.toLowerCase() === signer.toLowerCase());
                return <td key={`${signer}-${nonce}`}>{signed ? 'x' : ''}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const handleSafeClick = () => {
    window.open(`https://app.safe.global/home?safe=arb1:${safeAddress}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>Close</button>
        <h2 className="safe-title" onClick={handleSafeClick}>Transactions for {safeLabel}</h2>
        {loading && <p>Loading data...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && generateSignerParticipationTable()}
      </div>
    </div>
  );
};

export default TransactionModal;
