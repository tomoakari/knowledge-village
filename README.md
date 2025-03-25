# Knowledge Village

GitHubリポジトリの知識を活用した質問応答システム

## 概要

Knowledge Villageは、特定のプライベートGitHubリポジトリ（my-org/my-qa-repo）の情報を元に質問に回答するWebアプリケーションです。GoogleのGemma3 LLMを利用して、リポジトリ内の情報から最適な回答を生成します。

## 技術スタック

- **フロントエンド**
  - SvelteKit
  - TypeScript
  - Tailwind CSS
  - shadcn-svelte

- **バックエンド**
  - SvelteKit (サーバーサイドレンダリング)
  - Google Cloud Secret Manager
  - GitHub API (Octokit)
  - Google Gemma3 API

- **インフラ**
  - Google Cloud Run
  - Google Cloud Build
  - Google Container Registry

## 機能

- GitHubリポジトリに関する質問を入力できる
- リポジトリ内のコードやドキュメントを検索して関連情報を取得
- Gemma3 LLMを使用して質問に対する回答を生成
- レスポンシブデザインで様々なデバイスに対応

## セットアップ

### 前提条件

- Node.js 18以上
- npm 8以上
- Google Cloudアカウント
- GitHubアカウントとアクセストークン
- Google AI Gemma3 APIキー

### ローカル開発環境のセットアップ

1. リポジトリをクローン
   ```bash
   git clone https://github.com/tomoakari/knowledge-village.git
   cd knowledge-village
   ```

2. 依存関係のインストール
   ```bash
   npm install
   ```

3. 環境変数の設定
   ```bash
   # .env.localファイルを作成
   echo "GOOGLE_CLOUD_PROJECT=your-project-id" > .env.local
   echo "GITHUB_TOKEN=your-github-token" >> .env.local
   echo "GEMMA3_API_KEY=your-gemma3-api-key" >> .env.local
   ```

4. 開発サーバーの起動
   ```bash
   npm run dev
   ```

### GCPへのデプロイ

1. Google Cloud Secret Managerでシークレットを設定
   - `github-token`: GitHubのアクセストークン
   - `gemma3-api-key`: Gemma3のAPIキー

2. Cloud Buildの設定
   - GitHubリポジトリをCloud Buildに接続
   - `cloudbuild.yaml`を使用してビルドとデプロイを自動化

3. デプロイ
   - GitHubにプッシュすると自動的にCloud Buildが実行され、Cloud Runにデプロイされます

## 使い方

1. Webアプリケーションにアクセス
2. 質問入力フォームに質問を入力
3. 「質問する」ボタンをクリック
4. 回答が生成されるまで待機
5. 生成された回答を確認

## ライセンス

MIT

## 作者

tomoakari
