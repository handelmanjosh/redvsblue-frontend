


export default function StyledInput({ type, placeholder, onChange }: { type: string, placeholder: string, onChange: (e: any) => any }) {
    return (
        <input 
            type={type} 
            className="p-2 m-2 border w-[150px] border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder={placeholder}
            onChange={onChange}
        />
    );
}