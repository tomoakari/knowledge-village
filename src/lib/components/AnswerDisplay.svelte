<script lang="ts">
  export let answer: string | null = null;
  export let isLoading = false;
</script>

<div class="card w-full mt-6">
  <div class="card-header">
    <h2 class="card-title">回答</h2>
  </div>
  <div class="card-content">
    {#if isLoading}
      <div class="flex items-center justify-center py-10">
        <div class="spinner" style="width: 2rem; height: 2rem; border-width: 4px;"></div>
        <span class="text-lg" style="margin-left: 0.75rem;">回答を生成中...</span>
      </div>
    {:else if answer}
      <div class="prose prose-stone">
        {#each answer.split('\n') as line}
          <p>{line || ' '}</p>
        {/each}
      </div>
    {:else}
      <p class="py-10 text-center" style="color: var(--foreground-color); opacity: 0.7;">
        質問を入力すると、GitHubリポジトリの情報を元に回答が表示されます。
      </p>
    {/if}
  </div>
</div>
