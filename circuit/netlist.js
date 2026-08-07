/* =====================================================================
   netlist.js — 3DCircuit の main.js から必要な関数だけ抜き出したもの
   （main.js 本体はUI依存が大きいので、AR側ではこれだけを使う）

   元: main.js の buildNetlist() / updateGroundOffset() / applyGroundOffset()
   グローバル変数 components に依存していた部分を引数に変更しています。
   ===================================================================== */

/**
 * 配置された素子リストから netlist（ソルバー入力）を組み立てる
 * グリッドのノード命名規則:
 *   v_x_y = セル(x,y) の左辺   / v_(x+1)_y = 右辺
 *   h_x_y = セル(x,y) の上辺   / h_x_(y+1) = 下辺
 *   mid_x_y = 分岐素子の中心
 * @param {Array} components [{ id, type, x, y, rotation, value, rInt?, freq?, phase? }]
 */
function buildNetlist(components) {
    const netlist = [];

    components.forEach(c => {
        const left = `v_${c.x}_${c.y}`;
        const right = `v_${c.x + 1}_${c.y}`;
        const top = `h_${c.x}_${c.y}`;
        const bottom = `h_${c.x}_${c.y + 1}`;

        if (c.type === 'wire_l') {
            const mid = `mid_${c.x}_${c.y}`;
            if (c.rotation === 0) {
                netlist.push({ id: c.id + '_T', type: 'wire', nodes: [top, mid], value: 0 });
                netlist.push({ id: c.id + '_R', type: 'wire', nodes: [right, mid], value: 0 });
            } else if (c.rotation === 1) {
                netlist.push({ id: c.id + '_R', type: 'wire', nodes: [right, mid], value: 0 });
                netlist.push({ id: c.id + '_B', type: 'wire', nodes: [bottom, mid], value: 0 });
            } else if (c.rotation === 2) {
                netlist.push({ id: c.id + '_B', type: 'wire', nodes: [bottom, mid], value: 0 });
                netlist.push({ id: c.id + '_L', type: 'wire', nodes: [left, mid], value: 0 });
            } else {
                netlist.push({ id: c.id + '_L', type: 'wire', nodes: [left, mid], value: 0 });
                netlist.push({ id: c.id + '_T', type: 'wire', nodes: [top, mid], value: 0 });
            }
        } else if (c.type === 'wire_cross') {
            const mid = `mid_${c.x}_${c.y}`;
            netlist.push({ id: c.id + '_L', type: 'wire', nodes: [left, mid], value: 0 });
            netlist.push({ id: c.id + '_R', type: 'wire', nodes: [right, mid], value: 0 });
            netlist.push({ id: c.id + '_T', type: 'wire', nodes: [top, mid], value: 0 });
            netlist.push({ id: c.id + '_B', type: 'wire', nodes: [bottom, mid], value: 0 });
        } else if (c.type === 'wire_t') {
            const mid = `mid_${c.x}_${c.y}`;
            let n1, n2, n3;
            if (c.rotation === 0) { n1 = left; n2 = right; n3 = bottom; }
            else if (c.rotation === 1) { n1 = top; n2 = bottom; n3 = left; }
            else if (c.rotation === 2) { n1 = left; n2 = right; n3 = top; }
            else { n1 = top; n2 = bottom; n3 = right; }
            netlist.push({ id: c.id + '_1', type: 'wire', nodes: [n1, mid], value: 0 });
            netlist.push({ id: c.id + '_2', type: 'wire', nodes: [n2, mid], value: 0 });
            netlist.push({ id: c.id + '_3', type: 'wire', nodes: [n3, mid], value: 0 });
        } else if (c.type === 'switch') {
            if (c.value === 1) {
                let n1, n2;
                if (c.rotation === 0) { n1 = left; n2 = right; }
                else if (c.rotation === 1) { n1 = top; n2 = bottom; }
                else if (c.rotation === 2) { n1 = right; n2 = left; }
                else { n1 = bottom; n2 = top; }
                netlist.push({ id: c.id, type: 'wire', nodes: [n1, n2], value: 0 });
            }
        } else {
            let n1, n2;
            if (c.rotation === 0) { n1 = left; n2 = right; }
            else if (c.rotation === 1) { n1 = top; n2 = bottom; }
            else if (c.rotation === 2) { n1 = right; n2 = left; }
            else { n1 = bottom; n2 = top; }

            const netItem = { id: c.id, type: c.type, nodes: [n1, n2], value: c.value };
            if (c.type === 'battery' || c.type === 'ac_source') {
                netItem.rInt = c.rInt;
                if (c.type === 'ac_source') {
                    netItem.freq = c.freq;
                    netItem.phase = c.phase;
                }
            }
            netlist.push(netItem);
        }
    });

    return netlist;
}

/**
 * DC解析して最小電位を求める（これを 0 にそろえると立体が地面から生える）
 */
function computeGroundOffset(netlist) {
    if (!netlist || netlist.length === 0) return 0;
    const tempSim = new Simulator();
    const res = tempSim.solve(netlist, 0);
    if (!res.success) return 0;
    let minV = Infinity;
    for (const id in res.voltages) {
        if (res.voltages[id] < minV) minV = res.voltages[id];
    }
    return (minV === Infinity) ? 0 : minV;
}

/**
 * 解析結果の電位をオフセット分ずらす
 */
function applyGroundOffset(res, offset) {
    if (!res || !res.success || !res.voltages) return res;
    const shifted = {};
    for (const id in res.voltages) shifted[id] = res.voltages[id] - offset;
    return { ...res, voltages: shifted };
}
