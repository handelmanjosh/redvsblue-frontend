



export default function GameButton({ onClick, text }: { onClick: () => any, text: string}) {
    return (
        <button className="text-lg px-4 py-2 bg-white hover:brightness-90 active:brightness-75" onClick={onClick}>
            {text}
        </button>
    )
}