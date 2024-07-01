import BasicButton from "@/components/BasicButton";
import GameButton from "@/components/GameButton";
import { useWallet } from "@/components/hooks/WalletContext";
import Loader from "@/components/Loader";
import { transferBlueToContract, transferRedToContract } from "@/components/utils/crypto";
import { shortenAddress } from "@/components/utils/utils";
import WalletButton from "@/components/WalletButton";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";


let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
const payload: { down: string[], loc: [number, number]; } = { down: [], loc: [0, 0] };
let socket: Socket;
const imageMap: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();
const images = [
  "/background.png",
  "/f4-eagle.png",
  "/f14-tomcat.png",
  //"/f15-eagle.png", 
  //"/f16-viper.png",
  //"/f18-hornet.png", "/f22-raptor.png", "/f35-stealth.png", "/f86-sabre.png", "/f89-scorpion.png", 
  "/f106-deltadart.png",
  //"/f111-aardvark.png",
  "/f117-nighthawk.png",
  "/missile-1.png", "/missile-2.png", "/missile-3.png", "/missile-4.png", "/missile-5.png", "/missile-6.png", "/missile-7.png",
  "/explosions/explosion0.png", "/explosions/explosion1.png", "/explosions/explosion2.png", "/explosions/explosion3.png", "/explosions/explosion4.png",
];
const dataMap: Map<string, any> = new Map<string, any>(
  [
    ["/f4-eagle.png", { name: "F4 Eagle", description: "A supersonic jet interceptor and fighter-bomber used during the Vietnam War." }],
    ["/f14-tomcat.png", { name: "F14 Tomcat", description: "A twin-engine, variable sweep wings fighter that was used primarily by the U.S. Navy." }],
    ["/f15-eagle.png", { name: "F15 Eagle", description: "An American twin-engine, all-weather tactical fighter used by the U.S. Air Force." }],
    ["/f16-viper.png", { name: "F16 Viper", description: "A multirole fighter aircraft originally developed by General Dynamics for the United States Air Force." }],
    ["/f18-hornet.png", { name: "F18 Hornet", description: "A versatile aircraft that serves as both a fighter and attack aircraft for the U.S. Navy." }],
    ["/f22-raptor.png", { name: "F22 Raptor", description: "A fifth-generation, single-seat, twin-engine, all-weather stealth tactical fighter aircraft." }],
    ["/f35-stealth.png", { name: "F35 Lightning II", description: "A family of single-seat, single-engine, all-weather stealth multirole fighters." }],
    ["/f86-sabre.png", { name: "F86 Sabre", description: "A transonic jet fighter aircraft that became one of the best-known fighters of the Cold War." }],
    ["/f89-scorpion.png", { name: "F89 Scorpion", description: "An early American jet-powered fighter designed to be a night fighter." }],
    ["/f106-deltadart.png", { name: "F106 Delta Dart", description: "Known as the 'Ultimate Interceptor', an American supersonic, all-weather delta wing interceptor aircraft." }],
    ["/f111-aardvark.png", { name: "F111 Aardvark", description: "A tactical strike aircraft that also filled the roles of strategic bomber, reconnaissance, and electronic warfare in its various versions." }],
    ["/f117-nighthawk.png", { name: "F117 Nighthawk", description: "An American single-seat, twin-engine stealth attack aircraft that was the first operational aircraft to be designed around stealth technology." }],
  ]
);
let interval: any;
export default function Game() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [plane, setPlane] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [needsAccount, setNeedsAccount] = useState<boolean>(false);
  const [needsPlane, setNeedsPlane] = useState<boolean>(false);
  const [myMessages, setMyMessages] = useState<any[]>([]);
  const { account, connectWallet } = useWallet();
  const [team, setTeam] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return () => {
      socket?.disconnect();
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    if (router.isReady) {
      const { team } = router.query;
      setTeam(team as string);
    }
  }, [router, router.isReady]);
  const connect = async () => {
    try {
      //setLoading(true);
      if (!account && !plane) {
        setNeedsAccount(true);
        setNeedsPlane(true);
      }
      if (!account) {
        setNeedsAccount(true);
        return;
      }
      if (!plane) {
        setNeedsPlane(true);
        return;
      }
      if (isPlaying) return;
      setIsPlaying(true);
      let type: number;
      let price: number = 10;
      switch (plane) {
        case "/f4-eagle.png":
          type = 0;
          price = 10;
          break;
        case "/f14-tomcat.png": {
          type = 1;
          price = 30;
          break;
        }
        case "/f106-deltadart.png": {
          type = 2;
          price = 50;
          break;
        }
        case "/f117-nighthawk.png": {
          type = 3;
          price = 100;
          break;
        }
        default: {
          type = 0;
          price = 10;
          break;
        }
      }
      if (team === "red") {
        await transferRedToContract(price);
      } else {
        await transferBlueToContract(price);
      }
      socket?.disconnect();
      clearInterval(interval);
      socket = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
        query: {
          wallet: account,
          type,
          team,
        }
      });
      socket.connect();
      socket.on("data", handleSocketData);
      interval = setInterval(() => {
        socket.emit("data", payload);
      }, 1000 / 60);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const disconnect = () => {
    socket.disconnect();
    clearInterval(interval);
    setIsPlaying(false);
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    for (const image of images) {
      const img = document.createElement("img");
      img.src = image;
      imageMap.set(image, img);
    }
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
    };
  }, []);
  const adjustToMe = (me: any, others: any[]) => {
    for (const other of others) {
      other.x -= me.x;
      other.y -= me.y;
    }
    return others;
  };
  const distance = (i1: any, i2: any): number => Math.sqrt((i1.x - i2.x) ** 2 + (i1.y - i2.y) ** 2);
  const adjustToCanvas = (x: number, y: number) => [x + canvas.width / 2, -y + canvas.height / 2];
  const handleSocketData = (data: { players: any[], bullets: any[]; messages: any[]; }) => {
    console.log("recieved data");
    context.clearRect(0, 0, 10000, 10000);
    //webgl_clear_rect(context);
    let { players, bullets, messages } = data;
    const myMessages = messages.filter(([_, m]) => m.involves.includes(account));
    setMyMessages(myMessages.map(([_, m]) => m));
    setMessages(messages.map(([_, m]) => m));
    const MAX_DISTANCE = Math.sqrt((canvas.width / 2) ** 2 + (canvas.height / 2) ** 2);
    const me = players.find((player) => player.wallet === account);
    if (!me) {
      disconnect();
      return;
    }
    drawBackground(me);
    drawMiniMap(me, players);
    const tempMe = { x: me.x, y: me.y };
    bullets = adjustToMe(tempMe, bullets);
    players = adjustToMe(tempMe, players);
    // const p = players.filter((item) => distance(item, me) <= MAX_DISTANCE);
    // const ai = players.find(p => p.wallet.startsWith("ai"))!;
    // console.log(players.length, p.length, ai.x, ai.y);
    let combined = [...bullets, ...players].filter((item) => distance(item, me) <= MAX_DISTANCE);
    for (const item of combined) {
      draw(item);
      if (item.health && item.health > 0) {
        drawHealthbar(item);
      }
    }
  };
  const drawHealthbar = (item: any) => {
    const [adjX, adjY] = adjustToCanvas(item.x, item.y);
    const height = 10;
    const centerY = adjY - 30;
    context.fillStyle = "red";
    context.fillRect(adjX - item.maxHealth, centerY - height / 2, item.maxHealth * 2, height);
    context.fillStyle = "green";
    context.fillRect(adjX - item.maxHealth, centerY - height / 2, item.health * 2, height);
  };
  const drawMiniMap = (me: any, others: any[]) => {
    const minimapWidth = canvas.width / 10;
    const gameWidth = 10000;
    const minimapX = canvas.width - minimapWidth - 10; // 10 pixels padding from the right edge
    const minimapY = 10;
    context.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Semi-transparent black
    context.fillRect(minimapX, minimapY, minimapWidth, minimapWidth);
    // Function to draw a player on the minimap
    const drawPlayerOnMinimap = (player: any, color: string) => {
      context.fillStyle = color;
      const scale = minimapWidth / gameWidth;
      const x = minimapX + player.x * scale;
      const y = minimapY + (gameWidth - player.y) * scale;
      const size = 4; // Size of the player dot on the minimap

      context.beginPath();
      context.arc(x, y, size, 0, 2 * Math.PI);
      context.fillStyle = player.wallet === account ? "green" : player.team;
      context.fill();
    };

    // Draw the player (me) in green
    drawPlayerOnMinimap(me, 'green');

    // Draw other players (enemies) in red
    for (let other of others) {
      if (other.wallet === me.wallet) continue;
      drawPlayerOnMinimap(other, 'red');
    }
  };
  const draw = (item: any) => {
    const [adjX, adjY] = adjustToCanvas(item.x, item.y);
    //console.log({ adjX, adjY });
    context.save();
    context.translate(adjX, adjY);
    context.rotate(-item.angle + Math.PI / 2);
    //console.log(item.angle);
    if (item.img) {
      const img = imageMap.get(item.img)!;
      //webgl_draw_image(context, img, adjX, adjY, item.width, item.height);
      context.drawImage(img, - item.width / 2, -item.height / 2, item.width, item.height);
      if (item.team && item.wallet === account) {
        context.beginPath();
        context.strokeStyle = "green";
        context.arc(0, 0, item.width * 3, 0, Math.PI * 2);
        context.stroke();
      } else if (item.team) {
        context.beginPath();
        context.strokeStyle = item.team;
        context.arc(0, 0, item.width * 3, 0, Math.PI * 2);
        context.stroke();
      }
    } else {
      context.beginPath();
      context.arc(0, 0, item.width / 2, 0, Math.PI * 2);
      context.fillStyle = "red";
      context.fill();
    }
    context.restore();
  };
  const drawBackground = (me: any) => {
    // draw 4 by 4 grid;
    context.save();
    const width = 1000, height = 1000;
    const x = me.x, y = -1 * me.y;
    context.translate(-1 * (x % width), -1 * (y % height));
    const backgroundImage = imageMap.get("/background.png")!;
    //todo: make this more efficient using % and only drawing around player
    for (let x = -3; x < 3; x++) {
      for (let y = -2; y < 2; y++) {
        context.drawImage(backgroundImage, x * width, y * height, width, height);
        //webgl_draw_image(context, backgroundImage, x * width, y * height, width, height);
      }
    }
    context.restore();
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    let index: number = 0;
    while (index !== -1) {
      index = payload.down.indexOf(event.key);
      if (index !== -1) {
        payload.down.splice(index, 1);
      }
    }
  };
  const handleKeydown = (event: KeyboardEvent) => {
    if (!payload.down.includes(event.key)) {
      payload.down.push(event.key);
    }
  };
  const handleMouseMove = (event: MouseEvent) => {
    const adjX = event.clientX - (canvas.width / 2);
    const adjY = (canvas.height / 2) - event.clientY;
    payload.loc = [adjX, adjY];
  };
  const handleMouseDown = (event: MouseEvent) => {
    let buttonName: string = "";
    switch (event.button) {
      case 0:
        buttonName = "1";
        break;
      case 2:
        buttonName = "2";
        break;
    }
    if (buttonName && !payload.down.includes(buttonName)) {
      payload.down.push(buttonName);
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    let buttonName: string = "";
    switch (event.button) {
      case 0:
        buttonName = "1";
        break;
      case 2:
        buttonName = "2";
        break;
    }

    if (buttonName) {
      const index = payload.down.indexOf(buttonName);
      if (index > -1) {
        payload.down.splice(index, 1);
      }
    }
  };
  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col gap-4 justify-center items-center">
        <Loader color={team} />
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="w-screen h-screen relative" style={{ userSelect: "none", fontFamily: 'system-ui' }}>
      {!isPlaying &&
        <div className="absolute z-10 w-full h-full">
          <div className="bg-repeat w-full h-full" style={{ backgroundImage: `url("/background.png")` }}></div>
        </div>
      }
      <canvas id="canvas" />
      {isPlaying && myMessages && myMessages.length > 0 &&
        <div className="absolute inset-0 flex justify-center items-center z-20">
          <div className="flex flex-col justify-center items-center gap-2 bg-gray-300/60 rounded-lg p-4">
            {myMessages.map((message: any, i: number) => {
              if (message.killed === account) {
                return (
                  <div key={i} className="flex flex-row justify-center items-center gap-2">
                    <span className="text-green-600">You</span>
                    <p>were killed by </p>
                    <span className="text-red-600">{shorten(message.killedBy)}</span>
                  </div>
                );
              } else {
                return (
                  <div key={i} className="flex flex-row justify-center items-center gap-2">
                    <span className="text-green-600">You</span>
                    <p>killed</p>
                    <span className="text-red-600">{shorten(message.killed)}</span>
                  </div>
                );
              }
            })}
          </div>
        </div>
      }
      {!isPlaying &&
        <div className="absolute inset-0 flex justify-center items-center z-20">
          <div className="flex flex-col justify-center items-center rounded-lg p-4 w-auto">
            <div className={`flex flex-row justify-start items-center max-w-4xl p-4 space-x-4 ${needsPlane ? "border-4 border-red-600" : ""}`}>
              {images.map((image: string, i: number) => {
                const data = dataMap.get(image)!;
                if (!image.startsWith("/f")) return <></>;
                return (
                  <div className="flex flex-col justify-center items-center w-64 bg-yellow-500 p-4 rounded-lg shadow-xl" key={i}>
                    <img src={image} className="h-48 p-4" />
                    <h2 className="">{data.name}</h2>
                    <button onClick={() => setPlane(image)} className={`px-2 py-1 ${plane === image ? "bg-gray-400" : "bg-white"}`} disabled={plane === image}>{plane === image ? "Selected" : "Select"}</button>
                  </div>
                );
              })}
            </div>
            {team !== "red" && team != "blue" &&
              <div className="flex flex-col justify-center items-center gap-2 mb-2">
                <p>Select Team:</p>
                <div className="flex flex-row justify-center items-center gap-2">
                  <button className={`text-lg px-4 py-2 bg-red-500 hover:brightness-90 active:brightness-75`} onClick={() => setTeam("red")}>Team Red</button>
                  <button className={`text-lg px-4 py-2 bg-blue-600 hover:brightness-90 active:brightness-75`} onClick={() => setTeam("blue")}>Team Blue</button>
                </div>
              </div>
            }
            {/* <BasicButton text="Play" color="black" onClick={connect} /> */}
            <button className={`text-lg px-4 py-2 ${team === "red" ? "bg-red-500" : team === "blue" ? "bg-blue-500" : "bg-white"} hover:brightness-90 active:brightness-75`} onClick={connect}>Play</button>
            {/* <p className="text-white bg-red-600 p-2 rounded-lg mt-2">Best experience is on Desktop</p> */}
            <div className="mt-2 flex flex-row gap-2 justify-center items-center">
              <div className={`w-auto h-auto ${needsAccount ? "border-4 border-red-600" : ""}`}>
                <GameButton onClick={connectWallet} text={account ? shortenAddress(account) : "Connect Wallet"} />
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  );
};
function shorten(string: string) {
  if (string.startsWith("AI")) return string;
  return `${string.slice(0, 4)}...${string.slice(string.length - 4, string.length)}`;
}