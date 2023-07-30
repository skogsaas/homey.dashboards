<script lang="ts">

import { onMount } from 'svelte';
import { homey, devices } from '../lib/stores/homey';
import { items, editing } from '../lib/stores/dashboard';

import Fab, { Icon } from '@smui/fab';
import CircularProgress from '@smui/circular-progress';

import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';
import type { CapabilityEvent } from '$lib/types/Homey';

import { page } from '$app/stores';
import Dashboard from '$lib/Dashboard.svelte';
import AddDialog from '$lib/AddDialog.svelte';
import EditDialog from '$lib/EditDialog.svelte';

import type { GridItem } from '$lib/types/Grid';
import type { WidgetSettings } from '$lib/types/Widgets';

let baseUrl: string | null;
let homeyToken: string | null;
let appToken: string | null;

let loading: boolean = true;
let error: any | undefined = undefined;

let editOpen: boolean = false;
let editItem: GridItem;

let addOpen = false;

onMount(async () => {
    await connectHomeyAsync();

    // Load devices first, or else we will most likely display a lot of errors for each widget.
    await loadDevices();
    await loadAppSettings();
});

async function connectHomeyAsync() {
  homeyToken = $page.url.searchParams.get('homeyToken');
  appToken = $page.url.searchParams.get('appToken');
  baseUrl = $page.url.origin;

  // Inject development variables
  if(import.meta.env.VITE_HOMEY_URL) {
    baseUrl = import.meta.env.VITE_HOMEY_URL;
  }

  if(import.meta.env.VITE_HOMEY_TOKEN) {
    homeyToken = import.meta.env.VITE_HOMEY_TOKEN;
  }

  if(import.meta.env.VITE_APP_TOKEN) {
    appToken = import.meta.env.VITE_APP_TOKEN;
  }

  const instance = await HomeyAPI.createLocalAPI({
    address: baseUrl,
    token: homeyToken,
  });

  homey.set(instance);
}

async function loadAppSettings() {
  try {
    const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
    const result = await app.get({ path: '/dashboards?token=' + appToken });

    if(result != undefined && Array.isArray(result)) {
      items.set(result);
    }
  } catch (e) {
    error = e;
  } 

  loading = false;
}

async function saveAppSettings() {
  // Ensure we don't save with the draggable and resizable flags set to true
  toggleEdit();

  const app = await $homey.apps.getApp({ id: 'skogsaas.dashboards' });
  await app.put({ path: '/dashboards?token=' + appToken, body: $items });
}

async function loadDevices() {
  try {
    await $homey.devices.connect();
    const d = await $homey.devices.getDevices();
    
    Object.values(d).forEach(async (device) => {
      await device.connect();
      device.on('capability', (event: CapabilityEvent) => devices.capabilityUpdate(device.id, event));
    });

    devices.set(d);
  } catch(e) {
    error = e;
  }
}

function toggleEdit() {
  editing.toggle();

  items.setEditing($editing);
}

function addWidget(type: string) : void {
    if(type === undefined) {
      return;
    }

    editItem = items.addItem(type);
    editOpen = true;
}

function editWidget(item: GridItem) : void {
    editItem = item;
    editOpen = true;
}

function saveWidget(settings: WidgetSettings) {
  items.setSettings(editItem.id, settings);
}

</script>

<div class="header">
  {#if $editing}
    <Fab color="secondary" on:click={() => (addOpen = true)}>
      <Icon class="material-icons">add</Icon>
    </Fab>

    <Fab color="secondary" on:click={() => saveAppSettings()}>
      <Icon class="material-icons">save</Icon>
    </Fab>
  {/if}

  <Fab color="primary" on:click={() => toggleEdit()}>
    <Icon class="material-icons">settings</Icon>
  </Fab>
</div>

{#if loading}
  <div class="loading">
    <CircularProgress style="height: 128px; width: 128px;" indeterminate />
  </div>
{/if}

{#if error !== undefined}
  <div class="error">
    {error}
  </div>
{/if}

<Dashboard on:edit={e => editWidget(e.detail)} />
<AddDialog bind:open={addOpen} on:selected={e => addWidget(e.detail)} />
<EditDialog bind:open={editOpen} item={editItem} on:settings={(e) => saveWidget(e.detail)} />

<style>

.header {
  position: absolute;
  right: 0px;
  z-index: 6;
}

.loading {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  display: flex;
  justify-content: center;
}

</style>