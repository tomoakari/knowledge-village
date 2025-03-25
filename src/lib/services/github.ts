import { Octokit } from 'octokit';
import { getGithubToken } from '$lib/utils/secrets';

/**
 * GitHubサービスクラス
 * 特定のプライベートリポジトリからデータを取得するための機能を提供
 */
export class GitHubService {
  private octokit: Octokit | null = null;
  private owner: string;
  private repo: string;
  
  /**
   * GitHubサービスのコンストラクタ
   * @param owner リポジトリのオーナー
   * @param repo リポジトリ名
   */
  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }
  
  /**
   * Octokitクライアントを初期化する
   * @returns 初期化されたOctokitインスタンス
   */
  private async initOctokit(): Promise<Octokit> {
    if (!this.octokit) {
      const token = await getGithubToken();
      this.octokit = new Octokit({ auth: token });
    }
    return this.octokit;
  }
  
  /**
   * リポジトリ内のファイル一覧を取得する
   * @param path 取得するディレクトリパス（デフォルト: ルートディレクトリ）
   * @returns ファイル一覧
   */
  async getFiles(path: string = ''): Promise<any[]> {
    try {
      const octokit = await this.initOctokit();
      const response = await octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path
      });
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [response.data];
    } catch (error) {
      console.error('GitHubからファイル一覧の取得に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * リポジトリ内のファイル内容を取得する
   * @param path ファイルパス
   * @returns ファイルの内容（Base64デコード済み）
   */
  async getFileContent(path: string): Promise<string> {
    try {
      const octokit = await this.initOctokit();
      const response = await octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path
      });
      
      if (Array.isArray(response.data)) {
        throw new Error(`指定されたパス ${path} はディレクトリです`);
      }
      
      // @ts-ignore - content プロパティは存在するが型定義が不完全
      const content = response.data.content || '';
      // Base64デコード
      return Buffer.from(content, 'base64').toString('utf-8');
    } catch (error) {
      console.error(`GitHubからファイル ${path} の取得に失敗しました:`, error);
      throw error;
    }
  }
  
  /**
   * リポジトリ内を検索する
   * @param query 検索クエリ
   * @returns 検索結果
   */
  async searchCode(query: string): Promise<any[]> {
    try {
      const octokit = await this.initOctokit();
      const searchQuery = `${query} repo:${this.owner}/${this.repo}`;
      
      const response = await octokit.rest.search.code({
        q: searchQuery
      });
      
      return response.data.items;
    } catch (error) {
      console.error('GitHubでのコード検索に失敗しました:', error);
      throw error;
    }
  }
  
  /**
   * リポジトリの情報を取得する
   * @returns リポジトリ情報
   */
  async getRepoInfo(): Promise<any> {
    try {
      const octokit = await this.initOctokit();
      const response = await octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
      });
      
      return response.data;
    } catch (error) {
      console.error('GitHubからリポジトリ情報の取得に失敗しました:', error);
      throw error;
    }
  }
}

/**
 * デフォルトのGitHubサービスインスタンスを作成
 * @returns GitHubServiceインスタンス
 */
export function createDefaultGitHubService(): GitHubService {
  return new GitHubService('tomoakari', 'diiekkusu');
}
