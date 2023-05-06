export function sum(...args) {
    console.log(2222)
    return args.reduce((p, c) => p + c, 0)
}
