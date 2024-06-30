import React from 'react';
import { useWallet } from './hooks/WalletContext'; // Adjust the import path as necessary
import { shortenAddress } from './utils/utils';
import BasicButton from './BasicButton';

export default function WalletButton({notbasic}: {notbasic?: boolean}) {
    const { account, connectWallet } = useWallet();
    if (!notbasic) {
        return (
            <BasicButton color="black" text={`${account ? `${shortenAddress(account)}` : 'Connect Wallet'}`} onClick={() => !account && connectWallet()} />
        );
    } else {
        return (
            <button onClick={connectWallet}>{`${account ? `${shortenAddress(account)}` : 'Connect Wallet'}`}</button>
        )
    }
};

