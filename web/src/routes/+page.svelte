<script lang="ts">

import { onMount, type ComponentType } from 'svelte';

import { v4 as uuid } from 'uuid';

import Grid from "svelte-grid";
import gridHelp from "svelte-grid/build/helper";

import widgets from '../lib/widgets/widgets';

import Fab, { Icon } from '@smui/fab';
import Dialog, { Title, Content, Actions } from '@smui/dialog';
import Button, { Label } from '@smui/button';
import Drawer, { AppContent, Header, Subtitle } from '@smui/drawer';
import List, { Item, Text } from '@smui/list';

import HomeyAPI from 'homey-api/lib/HomeyAPI/HomeyAPI';

import WidgetContainer from '../lib/widgets/WidgetContainer.svelte';
import UnknownWidget from '../lib/widgets/unknown/UnknownWidget.svelte';
import UnknownEditor from '../lib/widgets/unknown/UnknownEditor.svelte';

import type { WidgetSettings } from '../lib/types/Widgets';
import type { CapabilityEvent, DeviceMap, DeviceObj, Homey } from '../lib/types/Homey';
import type { GridItem } from '../lib/types/Grid';

import { page } from '$app/stores';

let baseUrl: string | null;
let apiKey: string | null;
let homey: Homey;

let devices: DeviceMap = {};

const smallBreakpoint = 640;
const mediumBreakpoint = 768;
const largeBreakpoint = 1024;
const xlargeBreakpoint = 1280;
const breakpoints: number[] = [smallBreakpoint, mediumBreakpoint, largeBreakpoint, xlargeBreakpoint];

const smallColumns = 6;
const mediumColumns = 12;
const largeColumns = 18;
const xlargeColumns = 24;
const columns: number[] = [smallColumns, mediumColumns, largeColumns, xlargeColumns];

const breakpointColumns = [
  [smallBreakpoint, smallColumns], 
  [mediumBreakpoint, mediumColumns],
  [largeBreakpoint, largeColumns],
  [xlargeBreakpoint, xlargeColumns]
];
let items: GridItem[] = [];

onMount(async () => {
    apiKey = $page.url.searchParams.get('apiKey');
    baseUrl = $page.url.hostname;
    
    homey = await HomeyAPI.createLocalAPI({
      address: baseUrl,
      token: apiKey,
    });

    await loadAppSettings();

    await homey.devices.connect();
    devices = await homey.devices.getDevices();

    Object.values(devices).forEach(async (device) => {
      await device.connect();
      device.on('capability', (event: CapabilityEvent) => onCapabilityUpdate(device, event));
    });
});

function onCapabilityUpdate(device: DeviceObj, event: CapabilityEvent) {
  const capability = device.capabilitiesObj[event.capabilityId];
  capability.value = event.value;
  capability.lastUpdated.setUTCMilliseconds(event.transactionTime);

  // Force Svelte to detect changes to the device.
  devices[device.id] = device;
}

let editing: boolean = false;

function toggleEdit() {
  editing = !editing;

  if(!editing) {
    addOpen = false;
    settingsOpen = false;
  }

  items.forEach(item => {
    columns.forEach(column => {
      item[column].draggable = editing;
      item[column].resizable = editing;
    });
  });

  items = [...items];
}

let addOpen = false;
let addType: string | undefined = undefined;

function addWidget() {
    if(addType === undefined) {
      return;
    }

    const id = uuid();
    const settings = { id, type: addType };

    let newItem: GridItem = {
        id,
        settings,
    };

    columns.forEach(column => {
      newItem[column] = gridHelp.item({
            x: 0,
            y: 0,
            w: 3,
            h: 3,
            resizable: editing,
            draggable: editing
        });

        let findOutPosition = gridHelp.findSpace(newItem, items, column);
    
      newItem[column] = {
        ...newItem[column],
        ...findOutPosition
      };
    })

    items = [...items, newItem];

    openSettings(id, findEditor(addType), settings);

    addType = undefined;
    addOpen = false;
}

function addCancel() {
  addType = '';
  addOpen = false;
}

function deleteWidget(id: string) {
  const index = items.findIndex(item => item.id === id);
  items.splice(index, 1);
  items = items;
}

function findWidget(type: string) : ComponentType {
    const component = widgets.find(widget => widget.type === type)?.component;

    if(component != undefined) {
        return component;
    }

    return UnknownWidget
}

function findEditor(type: string) : ComponentType {
    const editor = widgets.find(widget => widget.type === type)?.editor;

    if(editor != undefined) {
        return editor;
    }

    return UnknownEditor
}

let settingsOpen: boolean = false;
let settingsId: string | undefined = undefined;
let settingsData: WidgetSettings | undefined = undefined;
let settingsComponent: ComponentType | undefined = undefined;

function openSettings(id: string, component: any, data: any) {
    settingsId = id;
    settingsComponent = component;
    settingsData = data;
    settingsOpen = true;
}

function closeWidgetSettings() {
  settingsOpen = false;
  settingsId = undefined;
  settingsData = undefined;
  settingsComponent = undefined;
}

function updateWidgetSettings(event: any) {
  settingsData = event.detail;

  items = items;
}

async function loadAppSettings() {
  try {
    items = await homey.apps.getAppSetting({ id: 'skogsaas.dashboards', name: 'dashboards' });

    if(!items || !Array.isArray(items)) {
      items = [];
    }
  } catch (error) {
    console.log(error);
  } 
}

async function saveAppSettings() {
  toggleEdit();
  
  await homey.apps.setAppSetting({ id: 'skogsaas.dashboards', name: 'dashboards', value: items });
}

function onFixed(item: GridItem, fixed: boolean) {
  items.forEach((i: GridItem) => { 
    if(i.id == item.id) {
      columns.forEach(column => {
        i[column].fixed = fixed;
        i[column].draggable = !fixed;
        i[column].resizable = !fixed;
      });
    }
   });

   items = [...items];
}

</script>

<Drawer variant="dismissible" bind:open={settingsOpen}>
  <Header>
    <Title>Settings</Title>
    <Subtitle>Edit the settings for widget.</Subtitle>
  </Header>
  <Content>
    <div class="settings-content">
      <svelte:component 
        this={settingsComponent} 
        {homey}
        {devices}
        settings={settingsData}
        on:settings={(event) => updateWidgetSettings(event)}></svelte:component>

      <Button on:click={() => closeWidgetSettings()}>Close</Button>
    </div>
  </Content>
</Drawer>

<AppContent>
  <div class="header">
    {#if editing}
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

  <Grid cols={breakpointColumns} gap={[10, 10]} bind:items={items} rowHeight={50} let:item let:dataItem>
      <WidgetContainer 
        {editing}
        fixed={item.fixed ?? false}
        on:fixed={(e) => onFixed(item, e.detail)}
        on:edit={() => openSettings(dataItem.id, findEditor(dataItem.settings.type), dataItem.settings)}
        on:delete={() => deleteWidget(dataItem.id)}
      >
          <svelte:component 
              this={findWidget(dataItem.settings.type)}
              {homey}
              {devices}
              {editing}
              settings={dataItem.settings}
          ></svelte:component>
      </WidgetContainer>
  </Grid>

  <Dialog bind:open={addOpen}>
    <Title>Select widget</Title>
    <Content>
      <List>
        {#each widgets as widget}
          <Item on:click={() => (addType = widget.type)}>
            <Text>{widget.label}</Text>
          </Item>
        {/each}
      </List>
    </Content>
    <Actions>
      <Button on:click={() => addCancel()}>
        <Label>Cancel</Label>
      </Button>
      <Button disabled={addType === undefined} on:click={() => addWidget()}>
        <Label>Add {addType ?? ''}</Label>
      </Button>
    </Actions>
  </Dialog>
</AppContent>

<style>

.header {
  position: absolute;
  right: 0px;
  z-index: 6;
}

.settings-content {
  width: calc(100% - 20px);
  padding: 10px;
}

</style>