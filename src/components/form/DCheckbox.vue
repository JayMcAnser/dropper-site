<script lang="ts" setup>
  const props = defineProps({
      modelValue: {
        type: Boolean,
        default: true
      },
      label: String,
      explain: String
    })
  defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mt-6 space-y-6">
    <div class="relative flex gap-x-3">
      <div class="flex h-6 items-center">
        <input
            :value="modelValue"
            @change="$emit('update:modelValue', $event.target.checked)"
            :checked="modelValue"
            id="comments" name="comments" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
      </div>
      <div class="text-sm leading-6">
        <label for="comments" class="font-medium text-gray-900">{{ label }}</label>
        <p class="text-gray-500">{{explain}}</p>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>
