


export default function BasicButton({ onClick, text, color }: { onClick: () => any, text: string, color: string }) {
    return (
        <button onClick={onClick} className={`border-2 p-4 border-${color} text-${color} hover:scale-105 transition-all duration-100`}>
            {text}
        </button>
    )
}