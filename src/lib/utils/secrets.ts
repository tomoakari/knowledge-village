import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * GCPのSecret Managerから機密情報を取得するユーティリティ関数
 * @param secretName 取得するシークレットの名前
 * @param version シークレットのバージョン（デフォルト: 'latest'）
 * @returns シークレットの値
 */
export async function getSecret(secretName: string, version: string = 'latest'): Promise<string> {
  try {
    // Secret Managerクライアントの初期化
    const client = new SecretManagerServiceClient();
    
    // プロジェクトIDの取得（Cloud Runの環境変数から）
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT環境変数が設定されていません');
    }
    
    // シークレットの完全修飾名を構築
    const name = `projects/${projectId}/secrets/${secretName}/versions/${version}`;
    
    // シークレットにアクセス
    const [response] = await client.accessSecretVersion({ name });
    
    // シークレットの値を取得
    const secretValue = response.payload?.data?.toString() || '';
    
    if (!secretValue) {
      throw new Error(`シークレット ${secretName} の値が空です`);
    }
    
    return secretValue;
  } catch (error) {
    console.error(`シークレット ${secretName} の取得に失敗しました:`, error);
    throw error;
  }
}

/**
 * GitHub APIトークンを取得する関数
 * @returns GitHubトークン
 */
export async function getGithubToken(): Promise<string> {
  return getSecret('github-token');
}

/**
 * Gemma3 APIキーを取得する関数
 * @returns Gemma3 APIキー
 */
export async function getGemma3ApiKey(): Promise<string> {
  return getSecret('gemma3-api-key');
}
