import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Shield, ShieldOff } from 'lucide-react';
import TransactionModal from './TransactionModal';
import { getNameOrAddress } from './addressMapping';

const formatUSD = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

const calculateTotalUSD = (safe, prices) => {
  const ethValue = parseFloat(safe.ethBalance) * prices.eth;
  const arbValue = parseFloat(safe.arbBalance) * prices.arb;
  const usdcValue = parseFloat(safe.usdcBalance) * prices.usdc;
  return ethValue + arbValue + usdcValue;
};

const SafeCard = ({ safe, prices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card onClick={handleCardClick}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="safe-label">{safe.label}</h2>
          </div>
          <p className="safe-address" title={safe.address}>
            {safe.address}
          </p>
        </CardHeader>
        <CardContent>
          {safe.error ? (
            <p className="error-message">Error: {safe.error}</p>
          ) : (
            <div className="card-content-layout">
              <div className="signers-info">
                <h3>Signers:</h3>
                {safe.owners ? (
                  <ul className="signers-list">
                    {safe.owners.map((owner) => (
                      <li key={owner} className="signer-address" title={owner}>
                        {getNameOrAddress(owner)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-signers">Unable to fetch owners</p>
                )}
              </div>
              <div className="content-divider"></div>
              <div className="balance-info">
                <p>
                  <strong>ETH</strong>
                  <span>{safe.ethBalance ? parseFloat(safe.ethBalance).toFixed(2) : 'N/A'}</span>
                </p>
                <p>
                  <strong>ARB</strong>
                  <span>{safe.arbBalance ? parseFloat(safe.arbBalance).toFixed(2) : 'N/A'}</span>
                </p>
                <p>
                  <strong>USDC</strong>
                  <span>{safe.usdcBalance ? parseFloat(safe.usdcBalance).toFixed(2) : 'N/A'}</span>
                </p>
                <div className="balance-divider"></div>
                <p className="total-usd">
                  <strong></strong>
                  <span>{formatUSD(calculateTotalUSD(safe, prices))}</span>
                </p>
              </div>
            </div>
          )}
          {safe.arbBalance && parseFloat(safe.arbBalance) > 0 && (
            <div className="delegation-status-wrapper">
              <div
                className={`delegation-status ${safe.isExcluded ? 'excluded' : 'not-excluded'}`}
                title={safe.isExcluded ?
                  "This multisig has delegated to the exclude address" :
                  "This multisig has not delegated to the exclude address"}
              >
                {safe.isExcluded ? (
                  <>
                    <Shield className="delegation-icon" size={16} />
                    <span>Delegated to exclude address</span>
                  </>
                ) : (
                  <>
                    <ShieldOff className="delegation-icon" size={16} />
                    <span>Not delegated to exclude address</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {isModalOpen && (
        <TransactionModal
          safeAddress={safe.address}
          safeLabel={safe.label}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default SafeCard;
