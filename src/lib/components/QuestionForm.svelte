<script lang="ts">
  export let onSubmit: (question: string) => Promise<void>;
  export let isLoading = false;
  
  let question = '';
  let error = '';
  
  async function handleSubmit() {
    error = '';
    
    if (!question.trim()) {
      error = '質問を入力してください';
      return;
    }
    
    try {
      await onSubmit(question);
    } catch (e) {
      error = 'エラーが発生しました。もう一度お試しください。';
      console.error('質問送信エラー:', e);
    }
  }
</script>

<div class="card w-full">
  <div class="card-header">
    <h2 class="card-title">質問を入力してください</h2>
  </div>
  <div class="card-content">
    <form on:submit|preventDefault={handleSubmit}>
      <textarea
        bind:value={question}
        placeholder="GitHubリポジトリに関する質問を入力してください..."
        rows={4}
        disabled={isLoading}
        class="textarea mb-4"
      ></textarea>
      
      {#if error}
        <p class="error-text mb-4">{error}</p>
      {/if}
      
      <button type="submit" disabled={isLoading} class="btn btn-primary w-full">
        {#if isLoading}
          <span>処理中...</span>
          <span class="spinner"></span>
        {:else}
          質問する
        {/if}
      </button>
    </form>
  </div>
</div>
