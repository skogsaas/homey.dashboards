<script lang="ts">
import { createEventDispatcher } from 'svelte';

import Card from '@smui/card';
import Fab, { Icon } from '@smui/fab';
import Menu from '@smui/menu';
import List, { Item, Text } from '@smui/list';

const dispatch = createEventDispatcher();

export let fixed: boolean;
export let editing: boolean;

let menuOpen: boolean = false;

</script>

<div class="widget-container">
  <Card>
    {#if editing}
      <div class="widget-edit">
        
        <Fab color="primary" on:click={() => (menuOpen = true)} mini>
            <Icon class="material-icons">menu</Icon>
        </Fab>

        <Menu bind:open={menuOpen}>
          <List>
            <Item on:SMUI:action={() => dispatch('edit')}>
              <Text>Edit</Text>
            </Item>
            <Item on:SMUI:action={() => dispatch('fixed', !fixed)}>
              <Text>{fixed ? 'Unlock' : 'Lock'}</Text>
            </Item>
            <Item on:SMUI:action={() => dispatch('delete')}>
              <Text><span class="delete">Delete</span></Text>
            </Item>
          </List>
        </Menu>
      </div>
    {/if}
    
    <slot></slot>
</Card>
</div>

<style>
.widget-container {
  height: 100%;
  width: 100%;
}

.widget-container :global(.mdc-card) {
  height: 100%;
  width: 100%;
}

.widget-edit :global(button) {
  position: absolute;
  top: -20px;
  left: -20px;
}

.delete {
  color: red;
}
</style>