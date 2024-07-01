


export function shortenAddress(address: string): string {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;
}

export function displayBigNumber(big: bigint) {
    const bigStr = big.toString();
    const len = bigStr.length;

    // If the number is too short, no need to format in scientific notation
    if (len <= 1) {
        return bigStr;
    }

    // Extract the first digit and optionally the next few digits for the mantissa
    const firstDigit = bigStr[0];
    const nextFewDigits = len > 1 ? bigStr.substring(1, 3) : ''; // Gets up to two more digits

    // Calculate the exponent as the number of digits after the first one
    const exponent = len - 1;

    // Format as x.xxe+y if more digits are present, otherwise just xxe+y
    const mantissa = nextFewDigits ? `${firstDigit}.${nextFewDigits}` : firstDigit;
    return `${mantissa}e${exponent}`;
}

export function timeToString(time: number): string {
    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(time / 86400); // Get total days
    const hours = Math.floor((time % 86400) / 3600); // Get remaining hours
    const minutes = Math.floor((time % 3600) / 60); // Get remaining minutes
    const seconds = time % 60; // Get remaining seconds

    // Format days, hours, minutes, and seconds to always be two digits
    const formattedDays = days.toString().padStart(2, '0');
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Combine into a single string
    return `${formattedDays}d:${formattedHours}h:${formattedMinutes}m:${formattedSeconds}s`;
}