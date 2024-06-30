import { useEffect, useState } from "react";
import WalletButton from "./WalletButton";
import { useWallet } from "./hooks/WalletContext";
import { getTokenBalances } from "./utils/crypto";
import { displayBigNumber } from "./utils/utils";



export default function NavBar() {
    const {account} = useWallet();
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    useEffect(() => {
        if (account) {
            getTokenBalances().then(({ platformBalance }) => {
                setAmount(platformBalance);
            });
        }
    }, [account]);
    return (
        <div className="flex flex-row justify-between items-center w-full p-2 border-b">
            <img src="/logo.png" className="w-12 aspect-square hover:cursor-pointer" onClick={() => window.location.href = "/"} />
            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-row justify-center items-center gap-6 text-3xl">
                <p className="text-red-500">Red</p>
                <p>VS</p>
                <p className="text-blue-500">Blue</p>
            </div>
            <div className="flex flex-row justify-center items-center gap-2">
                <p>{`${displayBigNumber(amount)} $PLATFORM`}</p>
                <WalletButton />
            </div>
        </div>
    )
}