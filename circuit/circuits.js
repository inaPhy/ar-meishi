/* =====================================================================
   circuits.js — presets/ フォルダの回路JSONを読み込む
   ---------------------------------------------------------------------
   回路を増やすには：
     1. 3DCircuit の「保存」で .json を書き出す
     2. circuit/presets/ に入れる
     3. circuit/presets/index.json のリストにファイル名を追加する

   JSON は 3DCircuit の保存形式そのままで動きます。
   "title" を入れておくと画面にその名前が出ます（無ければファイル名から作ります）。
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

/** 回路JSONを1つ読み込んで { title, components } を返す */
async function loadPresetFile(fileName, dir = PRESET_DIR) {
  const res = await fetch(dir + encodeURIComponent(fileName), { cache: 'no-cache' });
  if (!res.ok) throw new Error(fileName + ' を読めません (' + res.status + ')');
  const data = await res.json();

  const components = Array.isArray(data) ? data : data.components;
  if (!Array.isArray(components) || components.length === 0) {
    throw new Error(fileName + ' に components がありません');
  }

  // ファイル名から表示名を作る（"03_ブリッジ回路.json" → "ブリッジ回路"）
  const fallback = fileName.replace(/\.json$/i, '').replace(/^\d+[_-]?/, '');

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
