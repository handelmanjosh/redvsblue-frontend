import React, { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';

// Create a context
type WalletContextType = {
    account: string,
    provider: ethers.BrowserProvider,
    connectWallet: () => Promise<void>
    sendTransaction: (t: any) => Promise<any>
}
const WalletContext = createContext<WalletContextType>({} as WalletContextType);

// Provider component
export function WalletProvider({ children }: {children: React.ReactNode}) {
    const [account, setAccount] = useState<string>("");
    const [provider, setProvider] = useState<ethers.BrowserProvider>({} as ethers.BrowserProvider);

    const connectWallet = useCallback(async () => {
        if ((window as any).ethereum) {
            try {
                const web3Provider = new ethers.BrowserProvider((window as any).ethereum);
                await web3Provider.send('eth_requestAccounts', []);
                const signer = await web3Provider.getSigner();
                const account = await signer.getAddress();

                // Optionally switch to the Base L2 network
                await web3Provider.send('wallet_addEthereumChain', [{
                    chainId: '0x14a34', // Hexadecimal chain ID for Base Sepolia
                    chainName: 'Base Sepolia',
                    nativeCurrency: {
                        name: 'ETH', // The native currency symbol
                        symbol: 'ETH',
                        decimals: 18,
                    },
                    rpcUrls: [
                        'https://sepolia.base.org' // Primary RPC URL for Base Sepolia
                    ],
                    blockExplorerUrls: ['https://base-sepolia.blockscout.com'] // Block explorer URL for Base Sepolia
                }]);

                setAccount(account);
                setProvider(web3Provider);
            } catch (error) {
                console.error('Error connecting to wallet:', error);
            }
        } else {
            console.log('No Ethereum wallet found');
        }
    }, []);
    const sendTransaction = async (transaction: any) => {
        if (!provider) throw new Error("No provider available!");

        try {
            const signer = await provider.getSigner();
            const txResponse = await signer.sendTransaction(transaction);
            await txResponse.wait(); // Wait for the transaction to be mined
            return txResponse;
        } catch (error) {
            console.error('Error sending transaction:', error);
            throw error; // Re-throw the error to handle it in the UI
        }
    };
    return (
        <WalletContext.Provider value={{ account, provider, connectWallet, sendTransaction }}>
            {children}
        </WalletContext.Provider>
    );
};

// Hook to use wallet
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === null) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};