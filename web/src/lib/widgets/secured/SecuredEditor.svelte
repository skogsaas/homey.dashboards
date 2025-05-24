<script lang="ts">
    import TextPicker from '$lib/components/TextPicker.svelte';
    import { sha256 } from 'js-sha256';
    import type { SecuredSettings_v1 } from './SecuredSettings';
    import { alerts } from '$lib/stores/alerting';
    import { createEventDispatcher } from 'svelte';

    export let settings: SecuredSettings_v1;

    const dispatch = createEventDispatcher();
    
    let password: string = '';
    let mode: 'readonly' | 'blur' | 'hidden';

    $: onSettings(settings);
    $: onChanges(mode);
    $: placeholder = settings.hash !== undefined && settings.hash.length > 0
        ? 'Enter new password'
        : 'Set password';

    function onSettings(_settings: SecuredSettings_v1) {
        mode = _settings.mode || 'readonly';
    }

    function onSetPassword() {
        if (password.length > 0) {
            settings = {
                ...settings,
                hash: sha256(password)
            };

            dispatch('settings', settings);

            password = '';
            alerts.success('Saved', 'Password saved', 5000);
        }
    }

    function onChanges(
        _mode: any
    ) {
        if(_mode !== settings.mode) {
            settings = {
                ...settings,
                mode: _mode
            };

            dispatch('settings', settings);
        }
    }
</script>

{#if settings.hash !== undefined && settings.hash.length > 0}
    <p class="text-sm text-gray-500 mb-2">Current password is set.</p>
{:else}
    <p class="text-sm text-gray-500 mb-2">No password is set.</p>
{/if}

<TextPicker 
    label="Password"
    {placeholder}
    bind:value={password} 
/>

{#if password.length > 3}
    <button class="btn btn-primary w-full" on:click={onSetPassword}>Save</button>
{/if}

<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Readonly</span>
    <input type="radio" bind:group={mode} name="secured-mode" class="radio" value="readonly" checked={true}  />
  </label>
</div>
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Blur</span>
    <input type="radio" bind:group={mode} name="secured-mode" class="radio" value="blur" />
  </label>
</div>
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Hidden</span>
    <input type="radio" bind:group={mode} name="secured-mode" class="radio" value="hidden" />
  </label>
</div>