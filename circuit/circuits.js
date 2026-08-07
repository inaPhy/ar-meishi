/* =====================================================================
   circuits.js — presets/ フォルダの回路JSONを読み込む
   ---------------------------------------------------------------------
   回路を増やすには：
     1. 3DCircuit の「保存」で .json を書き出す
     2. ファイル名を半角英数字にして circuit/presets/ に入れる
     3. circuit/presets/index.json のリストにファイル名を追加する
     4. JSON の中に "title": "回路の名前" を足す（画面に出る名前）

   ★ファイル名は半角英数字にしてください。
     日本語名だと Mac と GitHub で「濁点の表し方」が食い違って読めなくなることがあります
     （「ブ」が1文字なのか「フ」+「゛」の2文字なのかの違い）。
     下の nameVariants で両方の形を試すようにしてありますが、英数字が確実です。

   JSON は 3DCircuit の保存形式そのままで動きます。
   "title" が無いときはファイル名から表示名を作ります。
   ===================================================================== */

const PRESET_DIR = './circuit/presets/';

/** presets/index.json に並んだファイル名を返す */
async function loadPresetIndex(dir = PRESET_DIR) {
  const res = await fetch(dir + 'index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('index.json を読めません (' + res.status + ')');
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) throw new Error('index.json が空です');
  return list;
}

/* 日本語ファイル名は Mac と GitHub で「濁点の表し方」が変わることがある。
   例: 「ブ」は 1文字の U+30D6（NFC）とも、「フ」+「゛」の2文字（NFD）とも書ける。
   index.json 側とファイル名側で形が食い違うと 404 になるので、両方の形を試す。 */
function nameVariants(fileName) {
  const set = new Set([fileName]);
  try { set.add(fileName.normalize('NFC')); set.add(fileName.normalize('NFD')); } catch (e) {}
  return [...set];
}

/** 回路JSONを1つ読み込んで { title, components } を返す */
async function loadPresetFile(fileName, dir = PRESET_DIR) {
  let res = null, lastStatus = 0;
  for (const v of nameVariants(fileName)) {
    const r = await fetch(dir + encodeURIComponent(v), { cache: 'no-cache' });
    if (r.ok) { res = r; break; }
    lastStatus = r.status;
  }
  if (!res) throw new Error(fileName + ' を読めません (' + lastStatus + ')');
  const data = await res.json();

  const components = Array.isArray(data) ? data : data.components;
  if (!Array.isArray(components) || components.length === 0) {
    throw new Error(fileName + ' に components がありません');
  }

  // ファイル名から表示名を作る（"03_ブリッジ回路.json" → "ブリッジ回路"）
  // 濁点が分解された形のまま表示すると崩れるので NFC に戻す
  let fallback = fileName.replace(/\.json$/i, '').replace(/^\d+[_-]?/, '');
  try { fallback = fallback.normalize('NFC'); } catch (e) {}

  return {
    title: data.title || fallback,
    // 元データを壊さないよう複製（pProgress などが書き込まれるため）
    components: components.map(c => ({ ...c })),
  };
}

/** 直前と違うファイルをなるべく選ぶ */
function pickPresetName(list, previous = null) {
  if (list.length === 1) return list[0];
  let name;
  do { name = list[Math.floor(Math.random() * list.length)]; } while (name === previous);
  return name;
}
