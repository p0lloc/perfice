<script lang="ts">
    import SveltyPicker from 'svelty-picker';
    import { computePosition, autoUpdate, shift, flip } from '@floating-ui/dom';

    let {value, time = false, disabled, onChange}: {
        value: string,
        time?: boolean,
        disabled: boolean,
        onChange: (v: string) => void
    } = $props();

    let valueState = $derived.by(() => {
        let date = new Date(value);
        let result = date.toISOString().slice(0, 10);

        if (time)
            result += ` ${date.toTimeString().slice(0, 5)}`;

        return result;
    });

    /**
     * Necessary to be able to render on top of modals
     */
    export function positionResolver(node: HTMLElement) {
        const inputElement = node.parentElement?.querySelector('input[type=text]');
        if (!inputElement) return;

        const removeFloating = autoUpdate(inputElement, node, () =>
            computePosition(inputElement, node, {
                placement: 'bottom-start',
                strategy: 'fixed',
                middleware: [
                    shift({
                        padding: 5
                    }),
                    flip()
                ]
            }).then(({x, y}) => {
                Object.assign(node.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    overflow: 'visible',
                    position: 'fixed',
                    zIndex: 500
                });
            })
        )

        return {
            destroy() {
                removeFloating();
            }
        }
    }
</script>

<SveltyPicker
        {disabled}
        mode={time ? "datetime": "date"}
        format="yyyy-mm-dd{time ? ' hh:ii' :''}"
        value={valueState}
        positionResolver={positionResolver}
        onChange={(v) => onChange(typeof v == "string" ? v : "")}
/>
