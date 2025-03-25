import { json, type RequestEvent } from '@sveltejs/kit';
import { createDefaultQAService } from '$lib/services/qa';

/**
 * POST /api/qa
 * 質問を受け取り、回答を返すAPIエンドポイント
 */
export const POST = async ({ request }: RequestEvent) => {
  try {
    // リクエストボディからデータを取得
    const data = await request.json();
    const { question } = data;
    
    // 質問が空の場合はエラーを返す
    if (!question || typeof question !== 'string' || question.trim() === '') {
      return json(
        { error: '質問を入力してください' },
        { status: 400 }
      );
    }
    
    // QAサービスを使用して回答を生成
    const qaService = createDefaultQAService();
    const answer = await qaService.getAnswer(question);
    
    // 回答をJSONで返す
    return json({ answer });
  } catch (error) {
    console.error('QA APIエラー:', error);
    return json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
};
