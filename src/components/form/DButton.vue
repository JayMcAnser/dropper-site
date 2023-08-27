<script lang="ts" setup>
  import { useRouter} from "vue-router";

  const props = defineProps({
      layout: {
        type: String,
        default(raw) {
//          console.log(raw.style)
          // debugger
          if (raw.style) {
            return raw.style
          }
          return 'btn-neutral'
        }
      },
      label: String,
      to: String,  // if set we want to move to this url
      url: String,

    }
  )
  const doClick = () => {
    let router = useRouter()
    if (props.to) {
      router.push({name: props.to})
    } else if (props.url) {
      router.push({url: props.url})
    }
  }


</script>

<template>
  <button class="btn m-3" :class="layout" @click="doClick()"><slot></slot></button>
</template>


<style scoped>

</style>
