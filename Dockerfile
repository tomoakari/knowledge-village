FROM node:20-slim AS build

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードのコピー
COPY . .

# ビルド
RUN npm run build

# 実行用イメージ
FROM node:20-slim AS runtime

WORKDIR /app

# 本番環境の依存関係のみをインストール
COPY package*.json ./
RUN npm ci --omit=dev

# ビルド済みのアプリケーションをコピー
COPY --from=build /app/build ./build

# 実行ユーザーを設定
USER node

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080

# アプリケーションの起動
CMD ["node", "build"]
