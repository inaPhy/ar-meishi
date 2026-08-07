/* =====================================================================
   particles.js — 電荷の位置（progress）を時間で進める処理
   元: main.js のアニメーションループ内にあった部分をそのまま切り出したもの。
   Simulator3D.updateParticles() は comp.pProgress / comp.legProgress を
   読むだけなので、その値を進める役割をここが担当します。
   ===================================================================== */

/**
 * @param {Array}  components        素子リスト（pProgress / legProgress が書き込まれます）
 * @param {Object} simulationResults solve() の結果
 * @param {Number} dt                経過時間[秒]
 * @param {Boolean} electronMode     true なら電子（負電荷）の向きに流す
 */
function advanceParticleProgress(components, simulationResults, dt, electronMode = false) {
    if (!components || !simulationResults) return;
    const I = simulationResults.currents || {};

    const step = (obj, side, speed) => {
        const v = electronMode ? -speed : speed;
        obj[side] += v * dt;
        if (obj[side] >= 1) obj[side] %= 1;
        if (obj[side] < 0) obj[side] = 1 - (Math.abs(obj[side]) % 1);
    };

    components.forEach(comp => {
        if (comp.type === 'wire_cross') {
            if (!comp.legProgress) comp.legProgress = { left: 0, right: 0, top: 0, bottom: 0 };
            step(comp.legProgress, 'left',   (I[comp.id + '_L'] || 0) * 30);
            step(comp.legProgress, 'right',  (I[comp.id + '_R'] || 0) * 30);
            step(comp.legProgress, 'top',    (I[comp.id + '_T'] || 0) * 30);
            step(comp.legProgress, 'bottom', (I[comp.id + '_B'] || 0) * 30);

        } else if (comp.type === 'wire_t') {
            if (!comp.legProgress) comp.legProgress = { left: 0, right: 0, top: 0, bottom: 0 };
            const i1 = I[comp.id + '_1'] || 0, i2 = I[comp.id + '_2'] || 0, i3 = I[comp.id + '_3'] || 0;
            let iL = 0, iR = 0, iT = 0, iB = 0;
            if (comp.rotation === 0)      { iL = i1; iR = i2; iB = i3; }
            else if (comp.rotation === 1) { iT = i1; iB = i2; iL = i3; }
            else if (comp.rotation === 2) { iL = i1; iR = i2; iT = i3; }
            else                          { iT = i1; iB = i2; iR = i3; }
            step(comp.legProgress, 'left',   iL * 30);
            step(comp.legProgress, 'right',  iR * 30);
            step(comp.legProgress, 'top',    iT * 30);
            step(comp.legProgress, 'bottom', iB * 30);

        } else if (comp.type === 'wire_l') {
            if (!comp.legProgress) comp.legProgress = { left: 0, right: 0, top: 0, bottom: 0 };
            const legs = {
                0: [['top', '_T'], ['right', '_R']],
                1: [['right', '_R'], ['bottom', '_B']],
                2: [['bottom', '_B'], ['left', '_L']],
                3: [['left', '_L'], ['top', '_T']],
            }[comp.rotation] || [];
            legs.forEach(([side, suffix]) => step(comp.legProgress, side, (I[comp.id + suffix] || 0) * 30));

        } else {
            if (!Object.prototype.hasOwnProperty.call(comp, 'pProgress')) comp.pProgress = 0;
            const holder = comp;              // pProgress は素子に直接持たせる
            const speed = (I[comp.id] || 0) * 15;
            const v = electronMode ? -speed : speed;
            holder.pProgress += v * dt;
            if (holder.pProgress >= 1) holder.pProgress %= 1;
            if (holder.pProgress < 0) holder.pProgress = 1 - (Math.abs(holder.pProgress) % 1);
        }
    });
}
