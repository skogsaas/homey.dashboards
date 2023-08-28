<script lang="ts">
import { createEventDispatcher } from 'svelte';

import { editing } from '$lib/stores/dashboard';

import Card from '@smui/card';
import Fab, { Icon } from '@smui/fab';
import Menu from '@smui/menu';
import List, { Item, Text } from '@smui/list';

const dispatch = createEventDispatcher();

export let fixed: boolean;

let menuOpen: boolean = false;

</script>

<Card 
  style="height: 100%; width: 100%; padding: 0px"
  on:click
>
  {#if $editing}
    <div class="widget-edit">
      
      <Fab style="z-index: 9;" color="primary" on:click={(e) => { menuOpen = true; }} mini>
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

<style>
.widget-edit :global(button) {
  position: absolute;
  top: -20px;
  left: -20px;
}

.delete {
  color: red;
}
</style>