import { createDefaultGitHubService, GitHubService } from './github';
import { createDefaultGemma3Service, Gemma3Service } from './gemma';

/**
 * QAサービスクラス
 * GitHubリポジトリからデータを取得し、Gemma3を使って回答を生成するサービス
 */
export class QAService {
  private githubService: GitHubService;
  private gemma3Service: Gemma3Service;
  
  /**
   * QAサービスのコンストラクタ
   * @param githubService GitHubサービス
   * @param gemma3Service Gemma3サービス
   */
  constructor(
    githubService: GitHubService = createDefaultGitHubService(),
    gemma3Service: Gemma3Service = createDefaultGemma3Service()
  ) {
    this.githubService = githubService;
    this.gemma3Service = gemma3Service;
  }
  
  /**
   * 質問に対する回答を生成する
   * @param question 質問文
   * @returns 生成された回答
   */
  async getAnswer(question: string): Promise<string> {
    try {
      // 質問に関連するGitHubリポジトリのデータを検索
      const searchResults = await this.githubService.searchCode(question);
      
      // 検索結果からコンテキストを構築
      let context = '';
      
      if (searchResults.length > 0) {
        // 最大5つの検索結果を使用
        const maxResults = Math.min(5, searchResults.length);
        
        for (let i = 0; i < maxResults; i++) {
          const result = searchResults[i];
          try {
            // ファイルの内容を取得
            const fileContent = await this.githubService.getFileContent(result.path);
            context += `ファイル: ${result.path}\n\n${fileContent}\n\n---\n\n`;
          } catch (error) {
            console.warn(`ファイル ${result.path} の取得に失敗しました:`, error);
          }
        }
      }
      
      // コンテキストが空の場合、リポジトリの基本情報を取得
      if (!context) {
        try {
          const repoInfo = await this.githubService.getRepoInfo();
          context = `リポジトリ名: ${repoInfo.full_name}\n説明: ${repoInfo.description || 'なし'}\n`;
          
          // READMEファイルを取得
          try {
            const readmeContent = await this.githubService.getFileContent('README.md');
            context += `\nREADME:\n${readmeContent}`;
          } catch (error) {
            console.warn('README.mdの取得に失敗しました:', error);
          }
        } catch (error) {
          console.warn('リポジトリ情報の取得に失敗しました:', error);
          context = '利用可能な情報がありません。';
        }
      }
      
      // Gemma3を使用して回答を生成
      return await this.gemma3Service.generateAnswer(question, context);
    } catch (error) {
      console.error('回答の生成に失敗しました:', error);
      return 'エラーが発生しました。しばらく経ってからもう一度お試しください。';
    }
  }
}

/**
 * デフォルトのQAサービスインスタンスを作成
 * @returns QAServiceインスタンス
 */
export function createDefaultQAService(): QAService {
  return new QAService();
}
