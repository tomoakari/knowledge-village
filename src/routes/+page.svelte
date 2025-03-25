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

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <header class="mb-8 text-center">
    <h1 class="text-3xl font-bold mb-2">Knowledge Village</h1>
    <p class="text-stone-600 dark:text-stone-400">
      GitHubリポジトリの知識を活用した質問応答システム
    </p>
  </header>
  
  <main>
    <QuestionForm onSubmit={handleSubmit} {isLoading} />
    <AnswerDisplay {answer} {isLoading} />
  </main>
  
  <footer class="mt-12 text-center text-stone-500 text-sm">
    <p>© 2025 Knowledge Village - Powered by SvelteKit, Gemma3, and GitHub</p>
  </footer>
</div>

<style>
  :global(body) {
    background-color: #f8f8f8;
    color: #333;
  }
  
  :global(.dark) {
    background-color: #1c1c1c;
    color: #f0f0f0;
  }
</style>
