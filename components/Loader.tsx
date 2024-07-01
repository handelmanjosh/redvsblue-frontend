

export default function Loader({ color }: { color: string; }) {
    if (color === "blue") {
        return (
            <div className="flex justify-center items-center">
                <div className="loader border-t-4 border-blue-500 rounded-full w-16 h-16"></div>
            </div>
        );
    } else {
        return (
            <div className="flex justify-center items-center">
                <div className="loader border-t-4 border-red-500 rounded-full w-16 h-16"></div>
            </div>
        );
    }
}