import React, {JSX} from "react";

/** ====== SHAPES (SVG) ====== */
const Shape = ({kind, size = 48}: { kind: string; size?: number }) => {
    const s = size, r = s / 2, stroke = 2;
    switch (kind) {
        case "●":
            return <circle cx={r} cy={r} r={r - stroke} stroke="currentColor" strokeWidth={stroke} fill="none"/>;
        case "■":
            return <rect x={stroke} y={stroke} width={s - 2 * stroke} height={s - 2 * stroke} stroke="currentColor"
                         strokeWidth={stroke} fill="none" rx={6}/>;
        case "▲":
            return <polygon points={`${r},${stroke} ${s - stroke},${s - stroke} ${stroke},${s - stroke}`}
                            stroke="currentColor" strokeWidth={stroke} fill="none"/>;
        case "◆":
            return <polygon points={`${r},${stroke} ${s - stroke},${r} ${r},${s - stroke} ${stroke},${r}`}
                            stroke="currentColor" strokeWidth={stroke} fill="none"/>;
        case "⊕":
            return (
                <>
                    <circle cx={r} cy={r} r={r - stroke} stroke="currentColor" strokeWidth={stroke} fill="none"/>
                    <line x1={r} y1={stroke * 1.2} x2={r} y2={s - stroke * 1.2} stroke="currentColor"
                          strokeWidth={stroke}/>
                    <line x1={stroke * 1.2} y1={r} x2={s - stroke * 1.2} y2={r} stroke="currentColor"
                          strokeWidth={stroke}/>
                </>
            );
        default:
            return <text x="50%" y="54%" textAnchor="middle" fontSize={s * 0.6}>{kind}</text>;
    }
};

const SvgIcon = ({kind, size = 48, className = ""}: { kind: string; size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-label={kind} role="img">
        <Shape kind={kind} size={size}/>
    </svg>
);

/** ====== RENDERERS ====== */

// Q2/Q20: matrix pattern (symbols)
export const SymbolPattern = ({grid}: { grid: (string)[][] }) => (
    <div className="inline-block rounded-xl border p-3 bg-white">
        <div className="grid" style={{gridTemplateColumns: `repeat(${grid[0].length}, minmax(40px, 56px))`, gap: 8}}>
            {grid.flatMap((row, i) => row.map((cell, j) =>
                <div key={`${i}-${j}`} className="flex items-center justify-center aspect-square rounded-md border">
                    {cell === "?" ? <span className="text-xl">?</span> : <SvgIcon kind={cell} size={40}/>}
                </div>
            ))}
        </div>
    </div>
);

// Q5: groups with repeats of a symbol
export const GroupRepeats = ({symbol, groups}: { symbol: string; groups: (number | string)[] }) => (
    <div className="space-y-2">
        {groups.map((g, idx) => (
            <div key={idx} className="flex items-center gap-2">
                <span className="w-8 text-sm text-gray-600">#{idx + 1}</span>
                <div className="flex flex-wrap gap-2">
                    {g === "?" ? <div className="w-10 h-10 border rounded-md flex items-center justify-center">?</div> :
                        Array.from({length: g as number}).map((_, k) => <SvgIcon key={k} kind={symbol} size={32}/>)}
                </div>
            </div>
        ))}
    </div>
);

// Q11: two bins (move to equalize)
export const TwoBins = ({left, right, symbol = "●", labels = ["Left", "Right"]}:
                        { left: number; right: number; symbol?: string; labels?: [string, string] }) => (
    <div className="flex gap-6">
        {[left, right].map((n, i) => (
            <div key={i} className="rounded-xl border p-3 min-w-[180px]">
                <div className="mb-2 text-center font-medium">{labels[i]}</div>
                <div className="flex flex-wrap gap-2">
                    {Array.from({length: n}).map((_, k) => <SvgIcon key={k} kind={symbol} size={28}/>)}
                </div>
            </div>
        ))}
    </div>
);

// Q16: grid of squares
export const GridSquares = ({rows = 4, cols = 4, size = 240}: { rows?: number; cols?: number; size?: number }) => {
    const s = size, cellW = s / cols, cellH = s / rows;
    const linesH = Array.from({length: rows + 1}, (_, r) => (
        <line key={`h${r}`} x1={0} y1={r * cellH} x2={s} y2={r * cellH} stroke="currentColor" strokeWidth={1}/>));
    const linesV = Array.from({length: cols + 1}, (_, c) => (
        <line key={`v${c}`} x1={c * cellW} y1={0} x2={c * cellW} y2={s} stroke="currentColor" strokeWidth={1}/>));
    return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="rounded-md border">
            <rect x={0} y={0} width={s} height={s} fill="white" stroke="currentColor" strokeWidth={2}/>
            {linesH}{linesV}
        </svg>
    );
};

// Q17: simple isometric cube stack
type IsoParams = { layout: number[][]; unit?: number }; // layout[r][c] = stack height
export const IsoCubes = ({layout, unit = 24}: IsoParams) => {
    const rows = layout.length, cols = Math.max(...layout.map(r => r.length));
    const W = (cols + rows) * unit, H = (cols + rows) * unit * 0.7 + Math.max(...layout.flat()) * unit * 0.9;

    const Cube = ({x, y, u}: { x: number; y: number; u: number }) => {
        const top = `M 0 0 L ${u} ${-u * 0.6} L ${2 * u} 0 L ${u} ${u * 0.6} Z`;
        const left = `M 0 0 L 0 ${u * 1.2} L ${u} ${u * 1.8} L ${u} ${u * 0.6} Z`;
        const right = `M ${2 * u} 0 L ${2 * u} ${u * 1.2} L ${u} ${u * 1.8} L ${u} ${u * 0.6} Z`;
        return (
            <g transform={`translate(${x},${y})`}>
                <path d={top} fill="white" stroke="currentColor"/>
                <path d={left} fill="white" stroke="currentColor"/>
                <path d={right} fill="white" stroke="currentColor"/>
            </g>
        );
    };

    const tiles: JSX.Element[] = [];
    layout.forEach((row, r) => {
        row.forEach((h, c) => {
            for (let k = 0; k < h; k++) {
                const x = (c + (rows - 1 - r)) * unit, y = (c + r) * unit * 0.6 - k * unit * 0.9;
                tiles.push(<Cube key={`${r}-${c}-${k}`} x={x} y={y} u={unit}/>);
            }
        });
    });

    return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="border rounded-md bg-white">{tiles}</svg>;
};

// Q18: regular polygon
export const RegularPolygon = ({sides, size = 140}: { sides: number; size?: number }) => {
    const r = size / 2 - 6, cx = size / 2, cy = size / 2;
    const pts = Array.from({length: sides}, (_, i) => {
        const a = -Math.PI / 2 + i * 2 * Math.PI / sides;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md border bg-white">
            <polygon points={pts} fill="none" stroke="currentColor" strokeWidth={2}/>
        </svg>
    );
};

// Q19: stack pattern (top-of-stack asked)
export const StackPattern = ({stacks}: { stacks: string[][] }) => (
    <div className="flex gap-6">
        {stacks.map((stack, i) => (
            <div key={i} className="flex flex-col items-center">
                <div className="h-40 w-28 border rounded-md flex flex-col-reverse items-center justify-start p-2 gap-2">
                    {stack[0] === "?" ? <span className="text-2xl mt-auto">?</span> :
                        stack.map((s, k) => <SvgIcon key={k} kind={s} size={32}/>)}
                </div>
                <div className="mt-2 text-sm text-gray-600">Fig {i + 1}</div>
            </div>
        ))}
    </div>
);

/** ====== REGISTRY ====== */
export const FIGURES: Record<string, (p: any) => JSX.Element> = {
    symbolPattern: (p) => <SymbolPattern {...p}/>,
    groupRepeats: (p) => <GroupRepeats {...p}/>,
    twoBins: (p) => <TwoBins {...p}/>,
    gridSquares: (p) => <GridSquares {...p}/>,
    isoCubes: (p) => <IsoCubes {...p}/>,
    regularPolygon: (p) => <RegularPolygon {...p}/>,
    stackPattern: (p) => <StackPattern {...p}/>
};

// Usage: const Comp = FIGURES[figure.renderer]; return <Comp {...figure.params} />;
