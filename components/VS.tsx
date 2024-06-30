import { useEffect, useState } from "react";
import { useWallet } from "./hooks/WalletContext";
import { getPoints, getPools, getPrices } from "./utils/crypto";
import BigNumber from "bignumber.js";


export default function VS() {
    const { account } = useWallet();
    const [redPerc, setRedPerc] = useState<number>(0);
    const [bluePerc, setBluePerc] = useState<number>(0);
    const [redPoints, setRedPoints] = useState<any>(0);
    const [bluePoints, setBluePoints] = useState<any>(0);
    
    useEffect(() => {
        (async () => {
            let [red, blue]: BigNumber[] = await getPoints();
            red = new BigNumber(red);
            blue = new BigNumber(blue);
            setRedPoints(red.toString());
            setBluePoints(blue.toString());
            if (red.eq(0)) red = red.plus(1)
            if (blue.eq(0)) blue = blue.plus(1)
            const redPerc = red.dividedBy(red.plus(blue)).multipliedBy(100).toNumber();
            const bluePerc = 100 - redPerc;
            setRedPerc(redPerc);
            setBluePerc(bluePerc);
        })();
    }, [account]);
    return (
        <div className="w-full h-12 bg-gray-200 overflow-hidden text-white">
            <div className="flex h-full">
                <div style={{ width: `${redPerc}%` }} className="bg-red-500 transition-width duration-500 ease-in-out flex justify-center items-center border-r-4 border-yellow-500">
                    {"$RED: " + redPoints + " Points"}
                </div>
                <div style={{ width: `${bluePerc}%` }} className="bg-blue-500 transition-width duration-500 ease-in-out flex justify-center items-center border-l-4 border-yellow-500">
                    {"$BLUE: " + bluePoints + " Points"}
                </div>
            </div>
        </div>
    )
}