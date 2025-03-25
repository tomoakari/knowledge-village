import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Octokit } from 'octokit';

interface GitHubSearchArgs {
  owner: string;
  repo: string;
  query: string;
}

interface GitHubFileContentArgs {
  owner: string;
  repo: string;
  path: string;
}

const isValidSearchArgs = (args: any): args is GitHubSearchArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.owner === 'string' &&
  typeof args.repo === 'string' &&
  typeof args.query === 'string';

const isValidFileContentArgs = (args: any): args is GitHubFileContentArgs =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.owner === 'string' &&
  typeof args.repo === 'string' &&
  typeof args.path === 'string';

export class GitHubMCPServer {
  private server: Server;
  private octokit: Octokit;

  constructor(githubToken: string) {
    this.server = new Server(
      {
        name: 'github-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.octokit = new Octokit({
      auth: githubToken
    });

    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // エラーハンドリング
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupResourceHandlers() {
    // リソーステンプレートの設定
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [
          {
            uriTemplate: 'github://{owner}/{repo}/file/{path}',
            name: 'GitHub Repository File',
            mimeType: 'text/plain',
            description: 'GitHubリポジトリ内のファイル内容を取得',
          },
        ],
      })
    );

    // リソース読み取りハンドラ
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const match = request.params.uri.match(
          /^github:\/\/([^\/]+)\/([^\/]+)\/file\/(.+)$/
        );
        if (!match) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Invalid URI format: ${request.params.uri}`
          );
        }
        
        const owner = decodeURIComponent(match[1]);
        const repo = decodeURIComponent(match[2]);
        const path = decodeURIComponent(match[3]);

        try {
          const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path,
          });

          if (Array.isArray(response.data)) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Path ${path} is a directory, not a file`
            );
          }

          // @ts-ignore - content プロパティは存在するが型定義が不完全
          const content = response.data.content || '';
          // Base64デコード
          const decodedContent = Buffer.from(content, 'base64').toString('utf-8');

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'text/plain',
                text: decodedContent,
              },
            ],
          };
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          
          throw new McpError(
            ErrorCode.InternalError,
            `GitHub API error: ${error.message}`
          );
        }
      }
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_github_repo',
          description: 'GitHubリポジトリ内のコードや文書を検索',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'リポジトリのオーナー名',
              },
              repo: {
                type: 'string',
                description: 'リポジトリ名',
              },
              query: {
                type: 'string',
                description: '検索クエリ',
              },
            },
            required: ['owner', 'repo', 'query'],
          },
        },
        {
          name: 'get_file_content',
          description: 'GitHubリポジトリ内のファイル内容を取得',
          inputSchema: {
            type: 'object',
            properties: {
              owner: {
                type: 'string',
                description: 'リポジトリのオーナー名',
              },
              repo: {
                type: 'string',
                description: 'リポジトリ名',
              },
              path: {
                type: 'string',
                description: 'ファイルパス',
              },
            },
            required: ['owner', 'repo', 'path'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'search_github_repo') {
        if (!isValidSearchArgs(request.params.arguments)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid search arguments'
          );
        }

        const { owner, repo, query } = request.params.arguments;
        try {
          const searchQuery = `${query} repo:${owner}/${repo}`;
          const response = await this.octokit.rest.search.code({
            q: searchQuery,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response.data.items, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `GitHub API error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      } else if (request.params.name === 'get_file_content') {
        if (!isValidFileContentArgs(request.params.arguments)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Invalid file content arguments'
          );
        }

        const { owner, repo, path } = request.params.arguments;
        try {
          const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path,
          });

          if (Array.isArray(response.data)) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Path ${path} is a directory, not a file`,
                },
              ],
              isError: true,
            };
          }

          // @ts-ignore - content プロパティは存在するが型定義が不完全
          const content = response.data.content || '';
          // Base64デコード
          const decodedContent = Buffer.from(content, 'base64').toString('utf-8');

          return {
            content: [
              {
                type: 'text',
                text: decodedContent,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `GitHub API error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      } else {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('GitHub MCP server running on stdio');
  }
}
