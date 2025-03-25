<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  
  export let answer: string | null = null;
  export let isLoading = false;
</script>

<Card class="w-full mt-6">
  <CardHeader>
    <CardTitle>回答</CardTitle>
  </CardHeader>
  <CardContent>
    {#if isLoading}
      <div class="flex items-center justify-center py-10">
        <div class="h-8 w-8 border-4 border-stone-300 border-t-stone-600 rounded-full animate-spin"></div>
        <span class="ml-3 text-lg">回答を生成中...</span>
      </div>
    {:else if answer}
      <div class="prose prose-stone dark:prose-invert max-w-none">
        {#each answer.split('\n') as line}
          <p>{line || ' '}</p>
        {/each}
      </div>
    {:else}
      <p class="text-stone-500 dark:text-stone-400 py-10 text-center">
        質問を入力すると、GitHubリポジトリの情報を元に回答が表示されます。
      </p>
    {/if}
  </CardContent>
</Card>
