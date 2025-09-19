<script lang="ts">
  import { FormField } from "formsnap";
  import { buttonVariants } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { ChevronDown } from "lucide-svelte";
  import type { SelectAttributes } from "svelte/elements";

  type $$Props = SelectAttributes;
  interface Props extends $$Props {
    class?: string | undefined | null;
    children?: import("svelte").Snippet;
  }

  let {
    class: className = undefined,
    children,
    ...rest
  }: Props = $props();
</script>

<div
  class={cn(
    "relative w-full",
    className
  )}
>
  <FormField name={rest.name ?? ""} let:attrs>
    <select
      {...attrs}
      class={cn(
        buttonVariants({ variant: "outline" }),
        "appearance-none w-full",
        className
      )}
      {...rest}
    >
      {@render children?.()}
    </select>
    <ChevronDown class="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
  </FormField>
</div>

