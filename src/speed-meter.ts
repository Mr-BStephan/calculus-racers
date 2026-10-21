/** Shared scale: 18 progressively taller blocks, from green through yellow to red. */
export function speedBlocks(power:number){const speed=Number.isFinite(power)?Math.max(5,Math.min(40,power)):5,lit=Math.round((speed-5)/35*17);return Array.from({length:18},(_,i)=>({color:i<7?'#59bd87':i<12?'#edc85e':'#ef785f',height:14+i*3.8,active:i<=lit}));}
