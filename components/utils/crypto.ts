import { BrowserProvider, Contract, parseEther } from "ethers";
import ABI from "./abi";
import { JsonRpcSigner } from "ethers";
import BigNumber from "bignumber.js";


export const contractAddress = "0x16253E30B16Ef8B611718F2Fd871ef7801aa910b";
export const DECIMALS = 1;
const tokenABI = [
    "function balanceOf(address) view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function description() view returns (string)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function transferFrom(address from, address to, uint value) returns (bool)",
    "function supply() view returns(uint)",
    "function approve(address a, uint amount)"
];
export async function swap(token: number, direction: string, amount: number) {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);
    const platformTokenAddress = await contract.platformToken();
    const redTokenAddress = await contract.tokenA();
    const blueTokenAddress = await contract.tokenB();
    if (token === 0) {
        if (direction === "left") {
            // righttoleft
           await approve(amount, platformTokenAddress);
           await contract.transfer(redTokenAddress, amount, false);
        } else {
            // lefttoright
            await approve(amount, redTokenAddress);
            await contract.transfer(redTokenAddress, amount, true);
        }
    } else {
        if (direction === "left") {
            await approve(amount, platformTokenAddress);
            await contract.transfer(blueTokenAddress, amount, false);
        } else {
            await approve(amount, blueTokenAddress);
            await contract.transfer(blueTokenAddress, amount, true);
        }
    }
}

async function approve(amount: number, contractAddress1: string) {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new Contract(contractAddress1, tokenABI, signer);
    await tokenContract.approve(contractAddress, amount);
}

export async function getPoints() {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);
    return await contract.viewPoints();
}


export async function buyPlatformToken(amount: number) {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);
    await contract.buyPlatformToken(amount, {
        value: 2,
    });
}

export async function sellPlatformToken(amount: number) {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(contractAddress, ABI, signer);
    await contract.sellPlatformToken(amount);
}
export async function getBalance(signer: JsonRpcSigner, platformAddress: any) {
    const contract = new Contract(platformAddress, tokenABI, signer);
    return await contract.balanceOf(signer.address);
}
export async function getTokenBalances() {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract  = new Contract(contractAddress, ABI, signer);
    const platformAddress = await contract.platformToken();
    const redTokenAddress = await contract.tokenA();
    const blueTokenAddress = await contract.tokenB();
    const platformBalance = (await getBalance(signer, platformAddress)) / BigInt(10 ** DECIMALS);
    const redBalance = (await getBalance(signer, redTokenAddress)) / BigInt(10 ** DECIMALS);
    const blueBalance = (await getBalance(signer, blueTokenAddress)) / BigInt(10 ** DECIMALS);
    return {
        platformBalance,
        redBalance,
        blueBalance,
    };
}
export async function getPools() {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract  = new Contract(contractAddress, ABI, signer);
    const redTokenAddress = await contract.tokenA();
    const blueTokenAddress = await contract.tokenB();
    const redPool = await contract.viewPool(redTokenAddress);
    const bluePool = await contract.viewPool(blueTokenAddress);
    return { redPool, bluePool };
}
export async function getPrices() {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract  = new Contract(contractAddress, ABI, signer);
    const redTokenAddress = await contract.tokenA();
    const blueTokenAddress = await contract.tokenB();
    const redPool = await contract.viewPool(redTokenAddress);
    const bluePool = await contract.viewPool(blueTokenAddress);
    // left: platformToken, right: token
    const redPoolLeft = new BigNumber(redPool.left.toString());
    const redPoolRight = new BigNumber(redPool.right.toString());
    const bluePoolLeft = new BigNumber(bluePool.left.toString());
    const bluePoolRight = new BigNumber(bluePool.right.toString());
    const redPrice = redPoolLeft.dividedBy(redPoolRight);
    const bluePrice = bluePoolLeft.dividedBy(bluePoolRight);
    return { redPrice: redPrice.toFixed(4), bluePrice: bluePrice.toFixed(4) };
}

export async function getTime() {
    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract  = new Contract(contractAddress, ABI, signer);
    const time = await contract.viewEndTime();
    return time;
}

