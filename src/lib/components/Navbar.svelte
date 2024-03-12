<script lang="ts">
	import { page } from '$app/stores';
</script>

<!-- Navbar with login/logout and home buttons -->
<div class="flex flex-row items-center w-full px-4 gap-2 h-16 bg-[#e3e6e9]">
	<a href="/" class="text-lg text-blue-800">Home</a>
	<div class="flex flex-row gap-8 w-full justify-end">
		{#if $page.data.user}
			<form method="post" action="/logout">
				<button type="submit" class="text-lg text-blue-800">
					<p class="text-primary-500">Sair</p>
				</button>
			</form>
		{:else}
			<a href="/login" class="text-lg text-blue-800">Login</a>
		{/if}
	</div>
</div>
