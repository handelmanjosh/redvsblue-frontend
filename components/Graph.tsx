import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, LinearScale, PointElement, CategoryScale } from 'chart.js';
import { useEffect, useState } from "react";

ChartJS.register(LineElement, LinearScale, PointElement, CategoryScale);
function randomBetween(low: number, high: number) {
    return low + Math.random() * (high - low);
}
function calculateBounds(n: number, range: number) {
    let low = Math.max(-n, -range);
    return { high: range, low };
}

export default function MintGraph({ inputData }: { inputData: number[]; }) {
    const [data, setData] = useState<any>();
    const [options, setOptions] = useState<any>();
    useEffect(() => {
        const data = {
            datasets: [
                {
                    label: 'y = x^2',
                    data: inputData.map((d, i) => { return { x: i, y: d }; }),
                    borderColor: 'black',
                    borderWidth: 2,
                    pointRadius: 0,
                },
            ],
        };
        const options = {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    grid: {
                        color: 'transparent',
                    },
                    ticks: {
                        color: 'black',
                        display: false,
                    },
                    title: {
                        display: true,
                        text: "Time",
                        color: "black"
                    }
                },
                y: {
                    type: 'linear',
                    grid: {
                        color: 'transparent',
                    },
                    ticks: {
                        color: 'black',
                    },
                    title: {
                        display: true,
                        text: "Price (in $PLATFORM)",
                        color: "black"
                    }
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        };
        setData(data);
        setOptions(options);
    }, [inputData]);
    // @ts-ignore // there is a type error on this next line
    return (data && options && <Line data={data} options={options} />);
}