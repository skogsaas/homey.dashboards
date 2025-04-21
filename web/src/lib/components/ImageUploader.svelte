<script lang="ts">
    export let imageId: string | undefined;

    let avatar: any | undefined;

    function onFileSelected(fileEvent: any) {
        let image = fileEvent.target.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = (readerEvent: any) => {
            var dataUrl = readerEvent.target.result;
            avatar = avatar;

            var base64 = dataUrl.replace(/^data:image\/?[A-z]*;base64,/);
        };
    }
</script>

{#if avatar !== undefined}
    <img class="avatar" src={avatar} alt="d" />
{/if}

<input type="file" class="file-input w-full max-w-xs" accept=".jpg, .jpeg, .png" on:change={(e)=>onFileSelected(e)} />