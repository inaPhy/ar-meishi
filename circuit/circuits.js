/* =====================================================================
   circuits.js — 名刺ARに出す回路のプリセット
   ---------------------------------------------------------------------
   3DCircuit の「保存」で書き出した JSON の components 配列を、
   下の CIRCUIT_PRESETS に追記していけば回路を増やせます。

     { name: "回路の名前", components: [ ...保存JSONの components をそのまま... ] }

   グリッドのノード規則（つながり方の確認用）
     セル(x,y) の 左辺=v_x_y  右辺=v_(x+1)_y  上辺=h_x_y  下辺=h_x_(y+1)
     rotation 0,2 = 横向き（左右がつながる）
     rotation 1,3 = 縦向き（上下がつながる）
     wire_l（コーナー）  0=上と右  1=右と下  2=下と左  3=左と上
     wire_t（T字）       0=左右と下 1=上下と左 2=左右と上 3=上下と右
   ===================================================================== */

const CIRCUIT_PRESETS = [
  {
    name: '直列回路',
    components: [
      { id: 's1',  type: 'wire_l',   x: 2, y: 2, rotation: 1, value: 0 },
      { id: 's2',  type: 'resistor', x: 3, y: 2, rotation: 0, value: 30 },
      { id: 's3',  type: 'bulb',     x: 4, y: 2, rotation: 0, value: 12.67 },
      { id: 's4',  type: 'resistor', x: 5, y: 2, rotation: 0, value: 20 },
      { id: 's5',  type: 'wire_l',   x: 6, y: 2, rotation: 2, value: 0 },
      { id: 's6',  type: 'wire',     x: 6, y: 3, rotation: 1, value: 0 },
      { id: 's7',  type: 'wire_l',   x: 6, y: 4, rotation: 3, value: 0 },
      { id: 's8',  type: 'wire',     x: 5, y: 4, rotation: 0, value: 0 },
      { id: 's9',  type: 'battery',  x: 4, y: 4, rotation: 2, value: 6, rInt: 0.01 },
      { id: 's10', type: 'wire',     x: 3, y: 4, rotation: 0, value: 0 },
      { id: 's11', type: 'wire_l',   x: 2, y: 4, rotation: 0, value: 0 },
      { id: 's12', type: 'wire',     x: 2, y: 3, rotation: 1, value: 0 },
    ],
  },
  {
    name: '並列回路',
    components: [
      { id: 'p1',  type: 'wire_l',   x: 2, y: 2, rotation: 1, value: 0 },
      { id: 'p2',  type: 'battery',  x: 3, y: 2, rotation: 0, value: 6, rInt: 0.01 },
      { id: 'p3',  type: 'wire_t',   x: 4, y: 2, rotation: 0, value: 0 },
      { id: 'p4',  type: 'wire',     x: 5, y: 2, rotation: 0, value: 0 },
      { id: 'p5',  type: 'wire_l',   x: 6, y: 2, rotation: 2, value: 0 },
      { id: 'p6',  type: 'resistor', x: 4, y: 3, rotation: 1, value: 30 },
      { id: 'p7',  type: 'wire',     x: 4, y: 4, rotation: 1, value: 0 },
      { id: 'p8',  type: 'resistor', x: 6, y: 3, rotation: 1, value: 50 },
      { id: 'p9',  type: 'wire',     x: 6, y: 4, rotation: 1, value: 0 },
      { id: 'p10', type: 'wire_t',   x: 4, y: 5, rotation: 2, value: 0 },
      { id: 'p11', type: 'wire',     x: 5, y: 5, rotation: 0, value: 0 },
      { id: 'p12', type: 'wire_l',   x: 6, y: 5, rotation: 3, value: 0 },
      { id: 'p13', type: 'wire',     x: 3, y: 5, rotation: 0, value: 0 },
      { id: 'p14', type: 'wire_l',   x: 2, y: 5, rotation: 0, value: 0 },
      { id: 'p15', type: 'wire',     x: 2, y: 3, rotation: 1, value: 0 },
      { id: 'p16', type: 'wire',     x: 2, y: 4, rotation: 1, value: 0 },
    ],
  },
  {
    name: '直並列回路',
    components: [
      { id: 'm1',  type: 'wire_l',   x: 2, y: 2, rotation: 1, value: 0 },
      { id: 'm2',  type: 'battery',  x: 3, y: 2, rotation: 0, value: 9, rInt: 0.01 },
      { id: 'm3',  type: 'wire_t',   x: 4, y: 2, rotation: 0, value: 0 },
      { id: 'm4',  type: 'resistor', x: 5, y: 2, rotation: 0, value: 20 },
      { id: 'm5',  type: 'wire_l',   x: 6, y: 2, rotation: 2, value: 0 },
      { id: 'm6',  type: 'resistor', x: 4, y: 3, rotation: 1, value: 30 },
      { id: 'm7',  type: 'wire',     x: 4, y: 4, rotation: 1, value: 0 },
      { id: 'm8',  type: 'bulb',     x: 6, y: 3, rotation: 1, value: 42 },
      { id: 'm9',  type: 'wire',     x: 6, y: 4, rotation: 1, value: 0 },
      { id: 'm10', type: 'wire_t',   x: 4, y: 5, rotation: 2, value: 0 },
      { id: 'm11', type: 'wire',     x: 5, y: 5, rotation: 0, value: 0 },
      { id: 'm12', type: 'wire_l',   x: 6, y: 5, rotation: 3, value: 0 },
      { id: 'm13', type: 'wire',     x: 3, y: 5, rotation: 0, value: 0 },
      { id: 'm14', type: 'wire_l',   x: 2, y: 5, rotation: 0, value: 0 },
      { id: 'm15', type: 'wire',     x: 2, y: 3, rotation: 1, value: 0 },
      { id: 'm16', type: 'wire',     x: 2, y: 4, rotation: 1, value: 0 },
    ],
  },
  {
    name: '電球2個とスイッチ',
    components: [
      { id: 'b1',  type: 'wire_l',   x: 2, y: 2, rotation: 1, value: 0 },
      { id: 'b2',  type: 'switch',   x: 3, y: 2, rotation: 0, value: 1 },
      { id: 'b3',  type: 'bulb',     x: 4, y: 2, rotation: 0, value: 8.33 },
      { id: 'b4',  type: 'bulb',     x: 5, y: 2, rotation: 0, value: 8.33 },
      { id: 'b5',  type: 'wire_l',   x: 6, y: 2, rotation: 2, value: 0 },
      { id: 'b6',  type: 'wire',     x: 6, y: 3, rotation: 1, value: 0 },
      { id: 'b7',  type: 'wire_l',   x: 6, y: 4, rotation: 3, value: 0 },
      { id: 'b8',  type: 'wire',     x: 5, y: 4, rotation: 0, value: 0 },
      { id: 'b9',  type: 'battery',  x: 4, y: 4, rotation: 2, value: 3, rInt: 0.01 },
      { id: 'b10', type: 'wire',     x: 3, y: 4, rotation: 0, value: 0 },
      { id: 'b11', type: 'wire_l',   x: 2, y: 4, rotation: 0, value: 0 },
      { id: 'b12', type: 'wire',     x: 2, y: 3, rotation: 1, value: 0 },
    ],
  },
];

/* ---------------------------------------------------------------------
   値のランダム化：素子の種類ごとに「ありえる値」から毎回1つ選ぶ
   （回路のつながり方は変えないので、必ず解ける回路のままです）
   --------------------------------------------------------------------- */
const VALUE_CHOICES = {
  battery:  [1.5, 3.0, 4.5, 6.0, 9.0],           // V
  resistor: [10, 20, 30, 47, 50, 100],           // Ω
  bulb:     [5, 8.33, 12.67, 42, 109],           // Ω（3DCircuitの定格プリセットと同じ）
};

/**
 * プリセットを1つ選び、値をランダム化した components を返す
 * @param {Function} rand 0以上1未満の乱数を返す関数（日替わりにしたい時は差し替える）
 */
function pickRandomCircuit(rand = Math.random) {
  const preset = CIRCUIT_PRESETS[Math.floor(rand() * CIRCUIT_PRESETS.length)];

  // 元データを壊さないように複製してから値を差し替える
  const components = preset.components.map(c => {
    const copy = { ...c };
    const choices = VALUE_CHOICES[c.type];
    if (choices) copy.value = choices[Math.floor(rand() * choices.length)];
    return copy;
  });

  return { name: preset.name, components };
}

/**
 * 日付をシードにした乱数（同じ日は誰が見ても同じ回路になる）
 * 使い方: pickRandomCircuit(dailyRandom())
 */
function dailyRandom() {
  const d = new Date();
  let s = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
