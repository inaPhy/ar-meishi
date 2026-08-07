# AR名刺（QR → Web AR）

名刺のQRコードを読むとサイトが開き、そのサイトが**名刺のおもて面そのものをマーカーとして認識**して、名刺の上に3Dオブジェクトを表示します。アプリのインストールは不要、ブラウザだけで動きます。

```
ar-meishi/
├── index.html              ← ARページ（GitHub Pagesで公開するもの）
├── assets/
│   ├── card-marker.png     ← マーカー画像（studioで生成）
│   └── targets.mind        ← MindARターゲット（studioで生成）
├── tools/
│   └── card-studio.html    ← 名刺デザイン＋QR＋.mind をつくるツール
└── .nojekyll
```

技術：**MindAR**（画像トラッキング）＋ **three.js**。どちらもCDN読み込みなのでビルド不要。

---

## 手順

### 0. 公開URLを先に決める

QRに焼き込むURLが必要なので、リポジトリ名を先に決めます。GitHubユーザー名が `USERNAME`、リポジトリ名が `ar-meishi` なら公開URLは：

```
https://USERNAME.github.io/ar-meishi/
```

### 1. GitHubに上げて Pages を有効化

```bash
cd ar-meishi
git init && git add -A && git commit -m "AR meishi"
git branch -M main
git remote add origin https://github.com/USERNAME/ar-meishi.git
git push -u origin main
```

GitHub のリポジトリ → **Settings → Pages** → Source を **Deploy from a branch**、Branch を **main / (root)** にして Save。1〜2分で公開されます。

> カメラは **HTTPS でしか動きません**。GitHub Pages は自動でHTTPSなのでそのままでOK。

### 2. 名刺とマーカーをつくる

`tools/card-studio.html` を**ブラウザで開く**（ダブルクリックでOK）。

1. 一番上の「ARページのURL」を手順0で決めたURLに書き換える
2. 名前・肩書・会社・連絡先を入力
3. **① card-marker.png** をダウンロード
4. **② targets.mind を作る** を押す（20〜60秒かかります）
5. **③ card-print.png** をダウンロード（印刷入稿用）

③ と ①②は**必ず同じデザイン**から作ってください。デザインを変えたら②もやり直しです（画像と .mind はペア）。

### 3. ファイルを置いて再デプロイ

`card-marker.png` と `targets.mind` を `assets/` に入れて push。

```bash
cp ~/Downloads/card-marker.png ~/Downloads/targets.mind assets/
git add -A && git commit -m "add marker" && git push
```

### 4. index.html の設定を自分用に

`index.html` の上のほうにある `CONFIG` を書き換えます。

```js
const CONFIG = {
  targetSrc : './assets/targets.mind',
  cardAspect: 55 / 91,          // 名刺の 高さ÷幅
  name      : 'Atsushi Inagaki',
  title     : 'Founder',
  website   : 'https://example.com',
  email     : 'you@example.com',
  color1    : 0x3f7dfb,
  color2    : 0x00d4b8,
};
```

### 5. 印刷して試す

`card-print.png` を名刺印刷サービスに入稿（97×61mm / 300dpi / 塗り足し3mm込み）。試すだけなら、`card-marker.png` を**実寸91×55mmで普通紙に印刷**するか、**PCの画面に表示**してスマホでかざすだけでも動きます。

スマホでQRを読む → 「AR を開始」→ カメラ許可 → 名刺にかざす。

---

## 3Dオブジェクトを差し替える

`index.html` の「メインの 3D オブジェクト」ブロックを編集します。座標系は：

- マーカー平面の**幅が 1.0**、高さが `cardAspect`（≒0.6）
- 原点は名刺の中心、**+Z が名刺から手前に浮く方向**

`.glb` を使いたい場合はこう書き換えます。

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltf = await new GLTFLoader().loadAsync('./assets/model.glb');
gltf.scene.scale.setScalar(0.3);
gltf.scene.position.set(0, 0, 0.2);
core.add(gltf.scene);

// アニメーション付きなら
const mixer = new THREE.AnimationMixer(gltf.scene);
gltf.animations.forEach(c => mixer.clipAction(c).play());
// 描画ループ内で mixer.update(dt);
```

---

## うまく認識しないとき

| 症状 | 対処 |
|---|---|
| カメラが起動しない | HTTPSで開いているか確認（`file://` や `http://` は不可。iOSはSafari推奨） |
| 全く認識しない | `targets.mind` が**印刷した画像と同じデザイン**から作られているか確認 |
| 認識が弱い・すぐ外れる | studioの「特徴パターンの量」を15〜25に増やして①②を作り直す |
| ちらつく・反射する | 光沢紙をやめてマット紙に。照明を斜めからにする |
| ズレる・揺れる | `filterMinCF` を小さく（0.00005）すると滑らか、大きく（0.001）すると追従が速い |
| 3Dが大きすぎ/小さすぎ | `core.scale` や各ジオメトリの半径を調整 |

`targets.mind` のオンライン生成（studioの②が動かない場合）：
https://hiukim.github.io/mind-ar-js-doc/tools/compile

---

## 仕組み

QRは**サイトを開くためだけ**に使い、AR認識には使いません。QRコード単体は同じ模様の繰り返しが多く画像トラッキングには不向きなので、MindARには**名刺の面全体（文字・パターン・QRを含む構図）**を特徴点として学習させています。だから studio が入れる非対称なパターンブロックが効きます。
