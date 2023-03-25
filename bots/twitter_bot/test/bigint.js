const bigIntMax = (...args) => args.reduce((m, e) => e > m ? e : m);

console.log(bigIntMax('1739577352295403521','1839586344341995521'))