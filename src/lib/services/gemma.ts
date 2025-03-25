import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { GenerationConfig } from '@google/generative-ai';
import { getGemma3ApiKey } from '$lib/utils/secrets';

/**
 * Gemma3サービスクラス
 * Google Gemma3 LLMを利用して回答を生成するための機能を提供
 */
export class Gemma3Service {
  private model: GenerativeModel | null = null;
  private modelName: string;
  
  /**
   * Gemma3サービスのコンストラクタ
   * @param modelName モデル名（デフォルト: 'gemini-1.5-pro'）
   */
  constructor(modelName: string = 'gemini-1.5-pro') {
    this.modelName = modelName;
  }
  
  /**
   * Gemma3モデルを初期化する
   * @returns 初期化されたGenerativeModelインスタンス
   */
  private async initModel(): Promise<GenerativeModel> {
    if (!this.model) {
      const apiKey = await getGemma3ApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: this.modelName });
    }
    return this.model;
  }
  
  /**
   * 質問に対する回答を生成する
   * @param question 質問文
   * @param context コンテキスト情報（GitHubリポジトリから取得したデータなど）
   * @returns 生成された回答
   */
  async generateAnswer(question: string, context: string): Promise<string> {
    try {
      const model = await this.initModel();
      
      // 生成設定
      const generationConfig: GenerationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      };
      
      // プロンプトの構築
      const prompt = `
あなたは知識ベースに基づいて質問に答えるアシスタントです。
以下の知識ベースの情報を使用して、質問に対して正確に回答してください。
知識ベースに情報がない場合は、「その情報は知識ベースにありません」と回答してください。

知識ベース:
${context}

質問: ${question}

回答:`;
      
      // 回答の生成
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemma3による回答生成に失敗しました:', error);
      throw error;
    }
  }
}

/**
 * デフォルトのGemma3サービスインスタンスを作成
 * @returns Gemma3Serviceインスタンス
 */
export function createDefaultGemma3Service(): Gemma3Service {
  return new Gemma3Service();
}
