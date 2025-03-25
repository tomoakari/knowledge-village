/**
 * MCPユーティリティ関数
 * MCPサーバーとの通信を行うためのユーティリティ関数を提供
 */

/**
 * GitHubリポジトリ内のコードを検索する
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @param query 検索クエリ
 * @returns 検索結果
 */
export async function searchGitHubRepo(owner: string, repo: string, query: string): Promise<any[]> {
  try {
    // @ts-ignore - グローバル関数として利用可能
    const result = await use_mcp_tool({
      server_name: 'github',
      tool_name: 'search_github_repo',
      arguments: {
        owner,
        repo,
        query
      }
    });
    
    return JSON.parse(result);
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
    // @ts-ignore - グローバル関数として利用可能
    const result = await use_mcp_tool({
      server_name: 'github',
      tool_name: 'get_file_content',
      arguments: {
        owner,
        repo,
        path
      }
    });
    
    return result;
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
  try {
    // @ts-ignore - グローバル関数として利用可能
    const result = await access_mcp_resource({
      server_name: 'github',
      uri: `github://${owner}/${repo}/file/${path}`
    });
    
    return result;
  } catch (error) {
    console.error(`ファイル ${path} のリソース取得エラー:`, error);
    throw error;
  }
}
