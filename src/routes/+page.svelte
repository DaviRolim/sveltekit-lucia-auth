<script lang="ts">
	import { page } from '$app/stores';
</script>


<div
	class="flex flex-col justify-center items-center h-screen w-full bg-gradient-to-r from-indigo-700 to-indigo-950"
>
	<div
		class="h-72 w-72 flex flex-col justify-around items-center bg-neutral-200 rounded-xl shadow-lg p-4"
	>
		{#if $page.data.user}
			<p class="text-xl font-semibold text-center text-gray-900">Logado como:<br /> {$page.data.user.name}</p>
		{:else}
			<p class="text-3xl font-semibold text-center text-gray-900">Você não está logado!</p>
			<p>
				Clique <a href="/login" class="text-blue-700">aqui</a> para ir para o login.
			</p>
		{/if}
	</div>
</div>
