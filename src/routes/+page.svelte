<script lang="ts">
  import QuestionForm from "$lib/components/QuestionForm.svelte";
  import AnswerDisplay from "$lib/components/AnswerDisplay.svelte";
  
  let answer: string | null = null;
  let isLoading = false;
  
  async function handleSubmit(question: string) {
    isLoading = true;
    answer = null;
    
    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }
      
      answer = data.answer;
    } catch (error) {
      console.error('回答取得エラー:', error);
      throw error;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="container px-4 py-8">
  <header class="mb-8 text-center">
    <h1 class="text-3xl font-bold mb-2">Knowledge Village</h1>
    <p style="opacity: 0.7;">
      GitHubリポジトリの知識を活用した質問応答システム
    </p>
  </header>
  
  <main>
    <QuestionForm onSubmit={handleSubmit} {isLoading} />
    <AnswerDisplay {answer} {isLoading} />
  </main>
  
  <footer class="mt-12 text-center text-sm" style="opacity: 0.7;">
    <p>© 2025 Knowledge Village - Powered by SvelteKit, Gemma3, and GitHub</p>
  </footer>
</div>
