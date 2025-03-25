import { Octokit } from 'octokit';
import { getGithubToken } from '$lib/utils/secrets';

// Octokitインスタンス
let octokit: Octokit | null = null;

// Octokitの初期化
async function getOctokit(): Promise<Octokit> {
  if (!octokit) {
    const token = await getGithubToken();
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

/**
 * GitHubリポジトリ内のコードを検索する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @param query 検索クエリ
 * @returns 検索結果
 */
export async function searchGitHubRepo(owner: string, repo: string, query: string): Promise<any[]> {
  try {
    const client = await getOctokit();
    const searchQuery = `${query} repo:${owner}/${repo}`;
    const response = await client.rest.search.code({ q: searchQuery });
    return response.data.items;
  } catch (error) {
    console.error('GitHub検索エラー:', error);
    return [];
  }
}

/**
 * GitHubリポジトリ内のファイル内容を取得する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @param path ファイルパス
 * @returns ファイル内容
 */
export async function getGitHubFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const client = await getOctokit();
    const response = await client.rest.repos.getContent({
      owner,
      repo,
      path
    });
    
    if (Array.isArray(response.data)) {
      throw new Error(`Path ${path} is a directory, not a file`);
    }
    
    // @ts-ignore - content プロパティは存在するが型定義が不完全
    const content = response.data.content || '';
    // Base64デコード
    return Buffer.from(content, 'base64').toString('utf-8');
  } catch (error) {
    console.error(`ファイル ${path} の取得エラー:`, error);
    throw error;
  }
}

/**
 * GitHubリポジトリ内のファイルをリソースとして取得する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @param path ファイルパス
 * @returns ファイル内容
 */
export async function getGitHubFileResource(owner: string, repo: string, path: string): Promise<string> {
  // リソースとして取得する代わりに、直接ファイル内容を取得
  return getGitHubFileContent(owner, repo, path);
}
