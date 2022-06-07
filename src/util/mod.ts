export default function mod(num: number, mod: number): number {
    return ((num % mod) + mod) % mod;
}
