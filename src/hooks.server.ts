import { GitHubMCPServer } from '$lib/mcp-server/index';
import { getGithubToken } from '$lib/utils/secrets';
import type { Handle } from '@sveltejs/kit';

// MCPサーバーインスタンス
let mcpServer: GitHubMCPServer | null = null;

// MCPサーバーの初期化
async function initMcpServer() {
  if (!mcpServer) {
    try {
      // GitHubトークンを取得
      const githubToken = await getGithubToken();
      
      // MCPサーバーを作成
      mcpServer = new GitHubMCPServer(githubToken);
      
      // サーバーを起動
      mcpServer.run().catch(console.error);
      console.log('GitHub MCP server started');
    } catch (error) {
      console.error('Failed to initialize MCP server:', error);
    }
  }
}

// サーバーフック
export const handle: Handle = async ({ event, resolve }) => {
  // MCPサーバーを初期化
  await initMcpServer();
  
  // 通常のリクエスト処理を続行
  return await resolve(event);
};
