<script lang="ts">
	import DynamicLabel from "./DynamicLabel.svelte";
	import type {
		InputAnswer,
		InputEntity,
		InputField,
	} from "@perfice/model/ui/dynamicInput";

	let { entities }: { entities: InputEntity[] } = $props();
	let available = $derived(
		entities.map((f) => f.name.toLowerCase().replace(" ", "-")),
	);
	let currentEntity = $state<InputEntity | undefined>(undefined);

	let dynamic = $state<InputAnswer[]>([]);
	let suggestions: string[] = $state([]);
	let currentField = $state<InputField | undefined>(undefined);

	function currentWord(full: string, cursorPos: number): number {
		let start = 0;
		for (let i = cursorPos; i >= 0; i--) {
			if (full.charAt(i) == "#") {
				break;
			}

			start = i;
		}

		return start;
	}

	function countSpaces(sub: string, pos: number): number {
		let res = 0;
		for (let i = 0; i < pos; i++) {
			if (sub.charAt(i) != ",") continue;

			res++;
		}

		return res;
	}

	function replaceRange(
		s: string,
		start: number,
		end: number,
		substitute: string,
	) {
		return s.substring(0, start) + substitute + s.substring(end);
	}

	function findIndices(str: string, char: string): number[] {
		var indices = [];
		for (var i = 0; i < str.length; i++) {
			if (str[i] === char) indices.push(i);
		}

		return indices;
	}

	function onKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLInputElement;
		let value = target.value;
		switch (e.key) {
			case "Backspace": {
				if (value != "") break;
				dynamic.pop();
				break;
			}

			case "Tab": {
				if (suggestions.length == 0) return;

				const cursorPos = target.selectionStart ?? 0;
				let start = currentWord(value, cursorPos);
				let suggestion = suggestions[0];
				if (currentEntity == null) {
					let entity = entities.find((e) => e.name == suggestion);
					if (entity == null) return;
					target.value = replaceRange(
						value,
						start,
						value.length,
						suggestion + ",",
					);
					e.preventDefault();
					currentField = entity.fields[0];
				} else {
					if (currentField == null) return;
					let idx = findIndices(value, ",");
					let fieldIndex = currentEntity.fields.indexOf(currentField);
					let lastField =
						fieldIndex == currentEntity.fields.length - 1;
					target.value = replaceRange(
						value,
						idx[fieldIndex] + 1,
						value.length,
						suggestion + (lastField ? "" : ","),
					);
					e.preventDefault();
					//console.log(value, currentField, value.indexOf(","));
				}
				break;
			}
			case "Enter": {
				if (
					currentEntity == null ||
					currentField !=
						currentEntity.fields[currentEntity.fields.length - 1]
				)
					return;

				dynamic.push({
					id: currentEntity.id,
					name: currentEntity.name,
					answers: target.value.split(",").slice(1),
				});
				target.value = "";
				currentField = undefined;
				break;
			}
		}

		setTimeout(() => {
			let full = target.value;
			const cursorPos = target.selectionStart ?? 0;
			const endOfInput = cursorPos == full.length;
			let start = currentWord(full, cursorPos);

			let value = full.substring(start);
			let parts = value.split(",");

			currentEntity = entities.find((e) => e.name == parts[0]);

			if (parts.length > 1 && currentEntity != null) {
				let index = countSpaces(value, cursorPos - start) - 1;
				if (index >= currentEntity.fields.length) {
					// Reached the end of fields, no more suggestions after this point
					suggestions = [];
					currentField = undefined;
					return;
				}

				currentField = currentEntity.fields[index];
				let isLastField =
					currentField ==
					currentEntity.fields[currentEntity.fields.length - 1];

				let isLastPartEmpty = parts[parts.length - 1] == "";
				if (currentField.options) {
					// Should provide suggestions as long as we're not at the absolute end with no more fields (and the user has typed something)

					suggestions = currentField.options.filter((k) =>
						k.includes(parts[index + 1]),
					);
					return;
				}
				suggestions = [];
			} else {
				if (full.charAt(start - (start != 0 ? 1 : 0)) != "#") {
					suggestions = [];
					return;
				}

				suggestions = available.filter((v) => v.includes(value));
				currentField = undefined;
			}
		});
	}
</script>

<div class="fixed bottom-12 flex gap-2 bg-white border border-green-400 p-2">
	{#if suggestions.length > 0}
		{#each suggestions as suggestion}
			<span>{suggestion}</span>
		{/each}
		<span class="text-gray-400">(Tab)</span>
	{:else if currentField != null && currentEntity != null}
		{currentField.name}
		{#if currentField == currentEntity.fields[currentEntity.fields.length - 1]}
			<span class="text-gray-400">(Enter)</span>
		{/if}
	{/if}
</div>
<div
	class="flex flex-wrap items-center md:w-1/3 border-red-500 border-2 inp py-1 px-2 gap-1"
>
	{#each dynamic as v}
		<DynamicLabel>{v.name}</DynamicLabel>
	{/each}
	<input
		type="text"
		placeholder="#mood 5,content"
		onkeydown={onKeydown}
		class="border-none outline-none flex-1"
		value="#"
	/>
</div>

<style>
	input[type="text"] {
		padding: 0px;
	}
</style>
