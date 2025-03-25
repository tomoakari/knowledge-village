<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
  
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

<Card class="w-full">
  <CardHeader>
    <CardTitle>質問を入力してください</CardTitle>
  </CardHeader>
  <CardContent>
    <form on:submit|preventDefault={handleSubmit}>
      <Textarea
        bind:value={question}
        placeholder="GitHubリポジトリに関する質問を入力してください..."
        rows={4}
        disabled={isLoading}
        class="mb-4"
      />
      
      {#if error}
        <p class="text-red-500 text-sm mb-4">{error}</p>
      {/if}
      
      <Button type="submit" disabled={isLoading} class="w-full">
        {#if isLoading}
          <span class="mr-2">処理中...</span>
          <div class="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        {:else}
          質問する
        {/if}
      </Button>
    </form>
  </CardContent>
</Card>
