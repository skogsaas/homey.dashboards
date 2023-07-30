<div class="widget-header">
    <slot name="header"></slot>
</div>

<div class="widget-body">
    <slot name="body"></slot>
</div>

<style>

.widget-header {
    display: flex;
    flex-grow: 0;
    font-size: small;
    overflow-x: hidden;
}

.widget-body {
    display: flex;
    flex-grow: 1;
}
</style>