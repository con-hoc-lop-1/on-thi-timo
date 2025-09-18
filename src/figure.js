// ================== FIGURE RENDERERS (JS version) ==================
import { useMemo } from "react";

function SvgIcon({ kind, size = 48, className = "" }) {
  const s = size,
    r = s / 2,
    stroke = 2;
  const common = { fill: "none", stroke: "currentColor", strokeWidth: stroke };
  switch (kind) {
    case "●":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <circle cx={r} cy={r} r={r - stroke} {...common} />
        </svg>
      );
    case "■":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <rect
            x={stroke}
            y={stroke}
            width={s - 2 * stroke}
            height={s - 2 * stroke}
            rx="6"
            {...common}
          />
        </svg>
      );
    case "▲":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <polygon
            points={`${r},${stroke} ${s - stroke},${s - stroke} ${stroke},${s - stroke}`}
            {...common}
          />
        </svg>
      );
    case "◆":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <polygon
            points={`${r},${stroke} ${s - stroke},${r} ${r},${s - stroke} ${stroke},${r}`}
            {...common}
          />
        </svg>
      );
    case "⊕":
      return (
        <svg
          width={s}
          height={s}
          viewBox={`0 0 ${s} ${s}`}
          className={className}
          aria-label={kind}
          role="img"
        >
          <circle cx={r} cy={r} r={r - stroke} {...common} />
          <line
            x1={r}
            y1={stroke * 1.2}
            x2={r}
            y2={s - stroke * 1.2}
            {...common}
          />
          <line
            x1={stroke * 1.2}
            y1={r}
            x2={s - stroke * 1.2}
            y2={r}
            {...common}
          />
        </svg>
      );
    default:
      // fallback khi symbol là chữ/số khác
      return (
        <div
          className={`d-inline-flex align-items-center justify-content-center ${className}`}
          style={{ width: s, height: s, fontSize: s * 0.6 }}
        >
          {kind}
        </div>
      );
  }
}

// Q2/Q20: ma trận biểu tượng
function SymbolPattern({ grid }) {
  const cols = grid?.[0]?.length || 0;
  return (
    <div className="border rounded p-3 bg-white">
      <div
        className="d-grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(40px, 56px))`,
          gap: 8,
        }}
      >
        {grid.flatMap((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="d-flex align-items-center justify-content-center border rounded"
              style={{ aspectRatio: "1 / 1", minWidth: 40 }}
            >
              {cell === "?" ? (
                <span className="fw-bold">?</span>
              ) : (
                <SvgIcon kind={cell} size={40} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Q5: nhóm lặp một symbol
function GroupRepeats({ symbol, groups }) {
  return (
    <div className="border rounded p-3 bg-white">
      {groups.map((g, idx) => (
        <div key={idx} className="d-flex align-items-center mb-2">
          <span className="text-muted me-2" style={{ width: 28 }}>
            #{idx + 1}
          </span>
          <div className="d-flex flex-wrap gap-2">
            {g === "?" ? (
              <div
                className="border rounded d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                ?
              </div>
            ) : (
              Array.from({ length: g }).map((_, k) => (
                <SvgIcon key={k} kind={symbol} size={28} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Q11: hai “thùng” để so sánh/move cho bằng
function TwoBins({ left, right, symbol = "●", labels = ["Left", "Right"] }) {
  return (
    <div className="d-flex gap-3">
      {[left, right].map((n, i) => (
        <div key={i} className="rounded border p-3" style={{ minWidth: 180 }}>
          <div className="mb-2 text-center fw-medium">{labels[i]}</div>
          <div className="d-flex flex-wrap gap-2" style={{ maxWidth: 150 }}>
            {Array.from({ length: n }).map((_, k) => (
              <SvgIcon key={k} kind={symbol} size={28} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function GridSquareTables({ data = [[]] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <table
      className="mx-auto border-collapse"
      style={{ borderSpacing: 0, borderCollapse: "collapse" }}
    >
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                style={{
                  width: 30,
                  height: 30,
                  border: cell ? "1px solid black" : "none",
                  padding: 0,
                }}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Q17: khối lập phương isometric đơn giản
function IsoCubes({ layout = [], unit = 18 }) {
  const u = unit;
  const h = u; // chiều cao khối theo trục z

  const depth = layout.length;
  const rows = layout[0]?.length || 0;
  const cols = layout[0]?.[0]?.length || 0;

  // bảng màu cho từng tầng
  const palette = [
    "#f28b82",
    "#fbbc04",
    "#34a853",
    "#4285f4",
    "#9c27b0",
    "#ff6d00",
  ];

  const items = [];
  for (let z = 0; z < depth; z++) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (layout[z][i][j]) {
          const cx = (j - i) * u;
          const cy = (j + i) * (u * 0.5) - z * h;
          items.push({ cx, cy, i, j, z });
        }
      }
    }
  }

  // tính khung bao
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  items.forEach(({ cx, cy }) => {
    minX = Math.min(minX, cx - u);
    maxX = Math.max(maxX, cx + u);
    minY = Math.min(minY, cy - u / 2);
    maxY = Math.max(maxY, cy + u / 2 + h);
  });
  const margin = 8;
  const W = (maxX - minX || 0) + margin * 2;
  const H = (maxY - minY || 0) + margin * 2;

  // vẽ 1 khối với màu dựa vào tầng z
  function Cube({ cx, cy, z }) {
    const tx = cx - minX + margin;
    const ty = cy - minY + margin;
    const base = palette[z % palette.length];
    const top = shadeColor(base, 40);
    const left = shadeColor(base, -10);
    const right = shadeColor(base, -30);

    const topPts = `0,${-u / 2} ${u},0 0,${u / 2} ${-u},0`;
    const leftPts = `${-u},0 0,${u / 2} 0,${u / 2 + h} ${-u},${h}`;
    const rightPts = `0,${u / 2} ${u},0 ${u},${h} 0,${u / 2 + h}`;

    return (
      <g transform={`translate(${tx},${ty})`}>
        <polygon points={topPts} fill={top} stroke="#000" />
        <polygon points={leftPts} fill={left} stroke="#000" />
        <polygon points={rightPts} fill={right} stroke="#000" />
      </g>
    );
  }

  // hàm pha màu sáng/tối
  function shadeColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;
    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);
    return `rgb(${r},${g},${b})`;
  }

  // vẽ xa → gần
  items.sort((a, b) => a.i + a.j + a.z - (b.i + b.j + b.z));

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="bg-white border rounded"
    >
      {items.map((p, idx) => (
        <Cube key={idx} {...p} />
      ))}
    </svg>
  );
}

function RegularPolygon({
  sides = 6,
  size = 280,
  radiusJitter = 0.6,
  minEdge = 12,
}) {
  const cx = size / 2;
  const cy = size / 2;
  const baseR = size / 2 - 6;

  const points = useMemo(() => {
    const step = (2 * Math.PI) / sides;
    const pts = [];

    for (let i = 0; i < sides; i++) {
      const angle = -Math.PI / 2 + i * step;

      // bán kính dao động mạnh để tạo lồi/lõm
      const rr = baseR * (0.3 + Math.random() * radiusJitter); // 0.3..(0.3+jitter)

      let x = cx + rr * Math.cos(angle);
      let y = cy + rr * Math.sin(angle);

      pts.push({ x, y });
    }

    // đảm bảo cạnh tối thiểu
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const dx = pts[j].x - pts[i].x;
      const dy = pts[j].y - pts[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minEdge) {
        // kéo điểm j ra xa hơn một chút
        const factor = minEdge / (dist + 0.001);
        pts[j].x = cx + (pts[j].x - cx) * factor;
        pts[j].y = cy + (pts[j].y - cy) * factor;
      }
    }

    return pts;
  }, [sides, size, radiusJitter, minEdge]);

  const ptsStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded border bg-white"
    >
      <polygon
        points={ptsStr}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="black" stroke="none" />
      ))}{" "}
    </svg>
  );
}

// Q19: chồng khối (hỏi phần tử trên cùng)
function StackPattern({ stacks }) {
  return (
    <div className="d-flex gap-3">
      {stacks.map((stack, i) => (
        <div key={i} className="d-flex flex-column align-items-center">
          <div
            className="border rounded d-flex flex-column-reverse align-items-center justify-content-start p-2 gap-2"
            style={{ height: 160, width: 112 }}
          >
            {stack[0] === "?" ? (
              <span className="fs-3 mt-auto">?</span>
            ) : (
              stack.map((s, k) => <SvgIcon key={k} kind={s} size={32} />)
            )}
          </div>
          <div className="mt-2 text-muted">Fig {i + 1}</div>
        </div>
      ))}
    </div>
  );
}
// ======= COLUMN ADDITION (A + A + A = BA) =======
function ColumnAddition({
  terms = ["A", "A", "A"],
  result = "BA",
  plusIndex = null,
  fontSize = 28,
}) {
  // Nếu không chỉ định, mặc định đặt dấu + trước hạng tử cuối
  const pIndex = plusIndex == null ? terms.length - 1 : plusIndex;

  // Tính độ rộng cột lớn nhất để canh phải
  const maxLen = Math.max(result.length, ...terms.map((t) => String(t).length));
  const padLeft = (s, n) => String(s).padStart(n, " ");

  const Row = ({ text, isPlus }) => (
    <div
      className="d-flex justify-content-end align-items-center"
      style={{ gap: 8 }}
    >
      <div
        style={{
          width: fontSize * 0.9,
          textAlign: "center",
          opacity: isPlus ? 1 : 0,
        }}
      >
        +
      </div>
      <pre
        className="m-0"
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize,
          lineHeight: 1.2,
        }}
      >
        {padLeft(text, maxLen)}
      </pre>
    </div>
  );

  return (
    <div className="d-inline-block p-3">
      {/* Các hạng tử */}
      {terms.map((t, i) => (
        <Row key={i} text={t} isPlus={i === pIndex} />
      ))}

      {/* Gạch ngang */}
      <div
        className="d-flex justify-content-end align-items-center"
        style={{ gap: 8, marginTop: 4 }}
      >
        <div style={{ width: fontSize * 0.9 }} />
        <div
          style={{
            width: `${fontSize * 0.65 * maxLen}px`,
            borderBottom: "2px solid currentColor",
          }}
        />
      </div>

      {/* Kết quả */}
      <Row text={result} isPlus={false} />
    </div>
  );
}
function TableFigure({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div />;
  }

  // Tìm số cột lớn nhất trong tất cả các hàng
  const maxCols = Math.max(...data.map((row) => row.length));

  return (
    <table className="table table-bordered text-center align-middle w-auto mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                colSpan={Math.floor(maxCols / row.length)}
                style={{ minWidth: 40, padding: "6px 12px" }}
              >
                {cell}
              </td>
            ))}
            {/* Nếu row.length không chia hết maxCols thì cho ô cuối cùng colSpan lớn hơn để lấp */}
            {row.length < maxCols &&
              row.length * Math.floor(maxCols / row.length) < maxCols && (
                <td
                  colSpan={
                    maxCols - row.length * Math.floor(maxCols / row.length)
                  }
                />
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function GroupMatrices({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="d-flex flex-wrap gap-4 justify-content-center">
      {data.map((grid, gi) => (
        <div key={gi} className="text-center">
          <table
            className="mx-auto border-collapse"
            style={{ borderSpacing: 0, borderCollapse: "collapse" }}
          >
            <tbody>
              {grid.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid black",
                        textAlign: "center",
                        verticalAlign: "middle",
                        fontSize: 16,
                        fontFamily: "monospace",
                      }}
                    >
                      {cell || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1 text-muted small">Group {gi + 1}</div>
        </div>
      ))}
    </div>
  );
}
// Q21: cân thăng bằng (balances)
function Balances({ balances = [] }) {
  return (
    <div className="d-flex flex-wrap gap-4 justify-content-center">
      {balances.map((pair, idx) => (
        <div key={idx} className="d-flex flex-column align-items-center">
          {/* Thanh ngang cân */}
          <div
            className="d-flex justify-content-between align-items-end"
            style={{
              minWidth: 200,
              borderBottom: "3px solid black",
              position: "relative",
            }}
          >
            <div className="d-flex gap-1">
              {pair[0].map((item, i) => (
                <span key={i} style={{ fontSize: 24 }}>
                  {item}
                </span>
              ))}
            </div>
            <div className="d-flex gap-1">
              {pair[1].map((item, i) => (
                <span key={i} style={{ fontSize: 24 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          {/* Trụ dọc */}
          <div
            style={{
              width: 0,
              height: 24,
              borderLeft: "3px solid black",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Registry các renderer theo tên trong JSON
const FIGURES = {
  symbolPattern: (p) => <SymbolPattern {...p} />,
  groupRepeats: (p) => <GroupRepeats {...p} />,
  twoBins: (p) => <TwoBins {...p} />,
  gridSquareTables: (p) => <GridSquareTables {...p} />,
  isoCubes: (p) => <IsoCubes {...p} />,
  regularPolygon: (p) => <RegularPolygon {...p} />,
  stackPattern: (p) => <StackPattern {...p} />,
  columnAddition: (p) => <ColumnAddition {...p} />,
  table: (p) => <TableFigure {...p} />,
  groupMatrices: (p) => <GroupMatrices {...p} />,
  balances: (p) => <Balances {...p} />, // 👈 thêm dòng này
};

// Hàm hiển thị figure theo schema dữ liệu
export function renderFigure(q) {
  // 1) Có renderer + params (ưu tiên)
  if (q.figure && q.figure.renderer) {
    const { renderer, params = {} } = q.figure;
    const Comp = FIGURES[renderer];
    if (Comp) return <div className="mt-3">{Comp(params)}</div>;
    return (
      <div className="alert alert-secondary my-3">
        Chưa hỗ trợ renderer: <code>{renderer}</code>
      </div>
    );
  }

  // 2) requires_image + image_ref (placeholder hoặc ảnh do bạn tự cắt)
  if (q.requires_image) {
    // Nếu đã có ảnh, thay src bên dưới cho đúng đường dẫn public của bạn:
    // return <div className="text-center my-3"><img src={`/assets/${q.image_ref}.png`} alt={q.image_ref} style={{maxWidth:"100%",height:"auto"}}/></div>;
    return (
      <div className="alert alert-info my-3">
        Câu này cần hình minh họa: <code>{q.image_ref || "unknown"}</code>. Hãy
        đặt ảnh vào <code>public/assets/</code> và hiển thị lại.
      </div>
    );
  }

  // 3) Không có figure
  return null;
}
