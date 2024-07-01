import BasicButton from "@/components/BasicButton";
import Divider from "@/components/Divider";
import Graph from "@/components/Graph";
import { useWallet } from "@/components/hooks/WalletContext";
import NavBar from "@/components/NavBar";
import StyledInput from "@/components/StyledInput";
import { buyPlatformToken, getPoints, getPrices, getTime, sellPlatformToken, swap } from "@/components/utils/crypto";
import { timeToString } from "@/components/utils/utils";
import VS from "@/components/VS";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;
export default function Home() {
  const { account } = useWallet();
  const [prices, setPrices] = useState<any>({ bluePrice: 0, redPrice: 0 });
  const [buyAmount, setBuyAmount] = useState<number>(0);
  const [sellAmount, setSellAmount] = useState<number>(0);
  const [blueBuyAmount, setBlueBuyAmount] = useState<number>(0);
  const [redBuyAmount, setRedBuyAmount] = useState<number>(0);
  const [swapped, setSwapped] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<[number, string]>([0, ""]);
  const [swappingBlue, setSwappingBlue] = useState<boolean>(false);
  const [swappingRed, setSwappingRed] = useState<boolean>(false);
  const [buyingPlatform, setBuyingPlatform] = useState<boolean>(false);
  const [sellingPlatform, setSellingPlatform] = useState<boolean>(false);
  const [data1, setData1] = useState<number[]>([]);
  const [data2, setData2] = useState<number[]>([]);
  useEffect(() => {
    let interval: any;
    if (account) {
      (async () => {
        // const points = await getPoints();
        const prices = await getPrices();
        const time = Number(await getTime());
        const current = Date.now() / 1000;
        const c = Math.floor(time - current);
        setTimeRemaining([c, timeToString(c)]);
        setPrices(prices);
        socket = io(process.env.NEXT_PUBLIC_SERVER_URL!);
        socket.on("fakeData", ({ data1, data2 }) => {
          setData1(data1);
          setData2(data2);
        });
        socket.emit("fakeData", { one: Number(prices.redPrice), two: Number(prices.bluePrice) });
        interval = setInterval(() => {
          setTimeRemaining(t => {
            return [t[0] - 1, timeToString(t[0] - 1)];
          });
        }, 1000);
      })();
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [account, swapped]);
  useEffect(() => {

  }, []);
  const onBuyPlatformToken = async () => {
    if (!account) return;
    setBuyingPlatform(true);
    try {
      await buyPlatformToken(buyAmount);
    } catch (e) {
      console.error(e);
    } finally {
      setBuyingPlatform(false);
    }
  };
  const onSellPlatformToken = async () => {
    if (!account) return;
    setSellingPlatform(true);
    try {
      await sellPlatformToken(sellAmount);
    } catch (e) {
      console.error(e);
    } finally {
      setSellingPlatform(false);
    }
  };
  const buyRed = async () => {
    if (!redBuyAmount) return;
    setSwappingRed(true);
    try {
      await swap(0, "left", redBuyAmount);
      setSwapped(!swapped);
    } catch (e) {
      console.error(e);
    } finally {
      setSwappingRed(false);
    }
  };
  const buyBlue = async () => {
    if (!blueBuyAmount) return;
    setSwappingBlue(true);
    try {
      await swap(1, "left", blueBuyAmount);
      setSwapped(!swapped);
    } catch (e) {
      console.error(e);
    } finally {
      setSwappingBlue(false);
    }
  };
  return (
    <div className="flex flex-col justify-start items-center w-full h-screen">
      <NavBar />
      <div className="grid grid-cols-2 w-full flex-grow relative">
        <div className="w-full h-full flex flex-col justify-start items-center gap-2">
          <Graph inputData={data1} />
          <p>{`$RED price: ${prices?.redPrice} $PLATFORM`}</p>
          <div className="flex flex-row justify-center items-center gap-2">
            <StyledInput type="number" onChange={(event: any) => setRedBuyAmount(Number(event.target.value))} placeholder="Amount" />
            <BasicButton onClick={buyRed} text={`${swappingRed ? "Buying..." : "Buy $RED"}`} color="red-500" />
          </div>
          <div className="w-full h-1 bg-black"></div>
          <p>Challenges:</p>
          <p>Kill <span className="text-blue-500">0/10</span> enemy ships - <span className="text-green-500">500</span> points</p>
          <p>Token price reaches <span className="text-yellow-500">1 $PLATFORM</span> - <span className="text-green-500">2000</span> points</p>
          <BasicButton onClick={() => window.location.href = "/play?team=red"} text="Play" color="red-500" />
        </div>
        <div className="w-full h-full flex flex-col justify-start items-center gap-2">
          <Graph inputData={data2} />
          <p>{`$BLUE price: ${prices?.bluePrice} $PLATFORM`}</p>
          <div className="flex flex-row justify-center items-center gap-2">
            <StyledInput type="number" onChange={(event: any) => setBlueBuyAmount(Number(event.target.value))} placeholder="Amount" />
            <BasicButton onClick={buyBlue} text={`${swappingBlue ? "Buying..." : "Buy $BLUE"}`} color="blue-500" />
          </div>
          <div className="w-full h-1 bg-black"></div>
          <p>Challenges:</p>
          <p>Kill <span className="text-red-500">0/10</span> enemy ships - <span className="text-green-500">500</span> points</p>
          <p>Token price reaches <span className="text-yellow-500">1 $PLATFORM</span> - <span className="text-green-500">2000</span> points</p>

          <BasicButton onClick={() => window.location.href = "/play?team=blue"} text="Play" color="blue-500" />
        </div>
        <div className="absolute left-[49.75%] top-0 bottom-0 w-[0.5%] bg-black"></div>
      </div>
      <VS />
      <div className="flex flex-col justify-center items-center w-full p-2 bg-yellow-500 gap-2">
        <div className="flex flex-row justify-center items-center gap-2">
          <p>{`Time remaining until rug: ${timeRemaining[1]}`}</p>
        </div>
        <div className="h-2 bg-black w-screen"></div>
        <div className="flex flex-row justify-center items-center">
          <p>Price: 1 ether = 1 PLATFORM</p>
          <Divider />
          <StyledInput type="number" onChange={(event: any) => setBuyAmount(Number(event.target.value))} placeholder="Amount" />
          <BasicButton onClick={onBuyPlatformToken} text={`${buyingPlatform ? "Buying..." : "Buy $PLATFORM"}`} color="black" />
          <Divider />
          <StyledInput type="number" onChange={(event: any) => setSellAmount(Number(event.target.value))} placeholder="Amount" />
          <BasicButton onClick={onSellPlatformToken} text={`${sellingPlatform ? "Selling..." : "Sell $PLATFORM"}`} color="black" />
        </div>
      </div>
    </div>
  );
}
