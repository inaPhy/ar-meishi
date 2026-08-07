/* =====================================================================
   circuits.js — presets/ フォルダの回路JSONを読み込む
   ---------------------------------------------------------------------
   回路を増やすには：
     1. 3DCircuit の「保存」で .json を書き出す
     2. ファイル名を半角英数字にして circuit/presets/ に入れる
     3. circuit/presets/index.json に file と name を追記する

   index.json の書き方
     [
       { "file": "01_series_resistors.json", "name": "抵抗の直列回路" },
       { "file": "my_circuit.json",          "name": "自作の回路" }
     ]

   name は画面上部に出る表示名です。3DCircuit が書き出した JSON には
   手を加えなくてよいので、回路を作り直しても index.json はそのままで済みます。

   ★ファイル名は半角英数字にしてください。
     日本語名だと Mac と GitHub で「濁点の表し方」が食い違って読めなくなることが
     あります（「ブ」が1文字なのか「フ」+「゛」の2文字なのかの違い）。
     下の nameVariants で両方の形を試すようにしてありますが、英数字が確実です。
   ===================================================================== */

const PRESET_DIR = './circuit/presets/';

/* index.json の1件を { file, name } の形にそろえる。
   古い書き方（ファイル名の文字列を並べただけ）も受け付ける。 */
function normalizeEntry(item) {
  if (typeof item === 'string') return { file: item, name: null };
  if (item && typeof item.file === 'string') {
    return { file: item.file, name: item.name || item.title || null };
  }
  return null;
}

/** presets/index.json を読んで [{ file, name }] を返す */
async function loadPresetIndex(dir = PRESET_DIR) {
  const res = await fetch(dir + 'index.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('index.json を読めません (' + res.status + ')');

  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error('index.json が配列になっていません');

  const list = raw.map(normalizeEntry).filter(Boolean);
  if (list.length === 0) throw new Error('index.json に有効な項目がありません');
  return list;
}

/* 日本語ファイル名の濁点は 1文字（NFC）と 2文字（NFD）の2通りの書き方がある。
   index.json 側とファイル名側で形が食い違うと 404 になるので、両方試す。 */
function nameVariants(fileName) {
  const set = new Set([fileName]);
  try { set.add(fileName.normalize('NFC')); set.add(fileName.normalize('NFD')); } catch (e) {}
  return [...set];
}

/** 回路JSONを1つ読み込んで { title, components } を返す
 *  表示名の優先順位: index.json の name → JSON内の title → ファイル名 */
async function loadPreset(entry, dir = PRESET_DIR) {
  const { file, name } = normalizeEntry(entry) || {};
  if (!file) throw new Error('読み込む対象が指定されていません');

  let res = null, lastStatus = 0;
  for (const v of nameVariants(file)) {
    const r = await fetch(dir + encodeURIComponent(v), { cache: 'no-cache' });
    if (r.ok) { res = r; break; }
    lastStatus = r.status;
  }
  if (!res) throw new Error(file + ' を読めません (' + lastStatus + ')');

  const data = await res.json();
  const components = Array.isArray(data) ? data : data.components;
  if (!Array.isArray(components) || components.length === 0) {
    throw new Error(file + ' に components がありません');
  }

  // 最後の手段：ファイル名から作る（"03_bridge.json" → "bridge"）
  let fromFile = file.replace(/\.json$/i, '').replace(/^\d+[_-]?/, '');
  try { fromFile = fromFile.normalize('NFC'); } catch (e) {}

  return {
    title: name || data.title || fromFile,
    // 元データを壊さないよう複製（pProgress などが書き込まれるため）
    components: components.map(c => ({ ...c })),
  };
}

/** 直前と違う回路をなるべく選ぶ */
function pickPreset(list, previousFile = null) {
  if (list.length === 1) return list[0];
  let e;
  do { e = list[Math.floor(Math.random() * list.length)]; } while (e.file === previousFile);
  return e;
}
