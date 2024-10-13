import React from 'react';
import SafeMultisigDashboard from './SafeMultisigDashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <SafeMultisigDashboard />
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from 'react';
// import { createPublicClient, http, formatEther, formatUnits, erc20Abi } from 'viem';
// import { arbitrum } from 'viem/chains';
// import { safeAddresses } from './safeAddresses';
// import { safeAbi } from './abis';
// import { ARB_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS, USDCB_TOKEN_ADDRESS } from './TokenAddresses';
// import { Card, CardHeader, CardContent } from './components/ui/card';
// import './App.css';

// const RPC_ENDPOINT = process.env.REACT_APP_ARBITRUM_RPC;

// if (!RPC_ENDPOINT) {
//   console.error('REACT_APP_ARBITRUM_RPC environment variable is not set');
// }

// const publicClient = createPublicClient({
//   chain: arbitrum,
//   transport: http(RPC_ENDPOINT)
// });

// const sortAddresses = (addresses) => {
//   return addresses.sort((a, b) => a.slice(2).localeCompare(b.slice(2)));
// };

// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// const retryWithBackoff = async (fn, maxRetries = 5, initialDelay = 1000) => {
//   let retries = 0;
//   while (retries < maxRetries) {
//     try {
//       return await fn();
//     } catch (error) {
//       if (error.message.includes('429') && retries < maxRetries - 1) {
//         const delayTime = initialDelay * Math.pow(2, retries);
//         console.log(`Rate limited, retrying in ${delayTime}ms...`);
//         await delay(delayTime);
//         retries++;
//       } else {
//         throw error;
//       }
//     }
//   }
// };

// const truncateAddress = (address, startLength = 6, endLength = 4) => {
//   if (!address) return '';
//   return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
// };

// function App() {
//   const [safeData, setSafeData] = useState([]);
//   const [error, setError] = useState(null);
//   const [prices, setPrices] = useState({ eth: 0, arb: 0, usdc: 1 }); // USDC is assumed to be $1

//   const fetchPrices = async () => {
//     try {
//       const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,arbitrum,usd-coin&vs_currencies=usd');
//       const data = await response.json();
//       setPrices({
//         eth: data.ethereum.usd,
//         arb: data.arbitrum.usd,
//         usdc: data['usd-coin'].usd
//       });
//     } catch (err) {
//       console.error('Error fetching prices:', err);
//     }
//   };

//   useEffect(() => {
//     const fetchSafeData = async () => {
//       if (!RPC_ENDPOINT) {
//         setError("REACT_APP_ARBITRUM_RPC environment variable is not set");
//         return;
//       }

//       try {
//         await fetchPrices(); // Fetch prices first

//         const data = await Promise.all(safeAddresses.map(async ({ label, address }) => {
//           try {
//             const ethBalance = await retryWithBackoff(() => publicClient.getBalance({ address }));
//             const owners = await retryWithBackoff(() => publicClient.readContract({
//               address,
//               abi: safeAbi,
//               functionName: 'getOwners',
//             }));
//             const arbBalance = await retryWithBackoff(() => publicClient.readContract({
//               address: ARB_TOKEN_ADDRESS,
//               abi: erc20Abi,
//               functionName: 'balanceOf',
//               args: [address],
//             }));
//             const usdcBalance = await retryWithBackoff(() => publicClient.readContract({
//               address: USDC_TOKEN_ADDRESS,
//               abi: erc20Abi,
//               functionName: 'balanceOf',
//               args: [address],
//             }));
//             const usdcbBalance = await retryWithBackoff(() => publicClient.readContract({
//               address: USDCB_TOKEN_ADDRESS,
//               abi: erc20Abi,
//               functionName: 'balanceOf',
//               args: [address],
//             }));
//             const totalUsdcBalance = usdcBalance + usdcbBalance;
//             return {
//               label,
//               address,
//               ethBalance: formatEther(ethBalance),
//               arbBalance: formatUnits(arbBalance, 18),
//               usdcBalance: formatUnits(totalUsdcBalance, 6),
//               owners: sortAddresses(owners),
//               error: null
//             };
//           } catch (err) {
//             console.error(`Error fetching data for ${label} (${address}):`, err);
//             return {
//               label,
//               address,
//               ethBalance: null,
//               arbBalance: null,
//               usdcBalance: null,
//               owners: null,
//               error: err.message
//             };
//           }
//         }));

//         setSafeData(data);
//       } catch (err) {
//         setError("Failed to fetch safe data");
//         console.error("Error fetching safe data:", err);
//       }
//     };

//     fetchSafeData();
//   }, []);

//   if (error) {
//     return <div className="error-message">Error: {error}</div>;
//   }

//   const formatUSD = (value) => {
//     return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
//   };

//   const calculateTotalUSD = (safe) => {
//     const ethValue = parseFloat(safe.ethBalance) * prices.eth;
//     const arbValue = parseFloat(safe.arbBalance) * prices.arb;
//     const usdcValue = parseFloat(safe.usdcBalance) * prices.usdc;
//     return ethValue + arbValue + usdcValue;
//   };

//   return (
//     <div className="safe-multisig-dashboard">
//       <h1 className="dashboard-title">
//         Arbitrum DAO
//       </h1>
//       <div className="safe-grid">
//         {safeData.map((safe) => (
//           <Card key={safe.address}>
//             <CardHeader address={safe.address}>
//               <h2 className="safe-label">{safe.label}</h2>
//               <p className="safe-address" title={safe.address}>
//                 {safe.address}
//               </p>
//             </CardHeader>
//             <CardContent>
//               {safe.error ? (
//                 <p className="error-message">Error: {safe.error}</p>
//               ) : (
//                 <div className="card-content-layout">
//                   <div className="signers-info">
//                     <h3>Signers:</h3>
//                     {safe.owners ? (
//                       <ul className="signers-list">
//                         {safe.owners.map((owner) => (
//                           <li key={owner} className="signer-address" title={owner}>
//                             {truncateAddress(owner)}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <p className="no-signers">Unable to fetch owners</p>
//                     )}
//                   </div>
//                   <div className="content-divider"></div>
//                   <div className="balance-info">
//                     <p>
//                       <strong>ETH</strong>
//                       <span>{safe.ethBalance ? parseFloat(safe.ethBalance).toFixed(2) : 'N/A'}</span>
//                     </p>
//                     <p>
//                       <strong>ARB</strong>
//                       <span>{safe.arbBalance ? parseFloat(safe.arbBalance).toFixed(2) : 'N/A'}</span>
//                     </p>
//                     <p>
//                       <strong>USDC</strong>
//                       <span>{safe.usdcBalance ? parseFloat(safe.usdcBalance).toFixed(2) : 'N/A'}</span>
//                     </p>
//                     <div className="balance-divider"></div>
//                     <p className="total-usd">
//                       <strong></strong>
//                       <span>{formatUSD(calculateTotalUSD(safe))}</span>
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;
