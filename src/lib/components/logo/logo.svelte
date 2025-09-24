<script lang="ts">
	import MyImage from '$lib/assets/img/logoOpenProduct.png?enhanced';
	let size = $props();
	// ../../assets/img/logoOpenProduct.png
</script>

<enhanced:img
  class="logo-img"
  src="{MyImage}"
  sizes="min(24px, 100vw)"
  alt="OpenProduct"
/>
<style>
	img.logo-img {
		width: 24px;
		height: auto;
	}
</style>