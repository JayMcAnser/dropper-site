<script lang="ts" setup>
  import { v4 as uuidv4 } from 'uuid'

  defineProps({
    'modelValue': String,
    'label': String,
    'placeholder': String,
    'blur': Function,
    'validationError': {
      type: String,
      default: ''
    },
    'name': {
      type: String,
      default(raw) {
        if (!raw.name) {
          return uuidv4()
        }
        return raw.name
      }
    },
    'type': {
      type: String,
      default(raw) {
        if (!raw.type) {
          return 'text'
        }
        return raw.type
      }
    }
  })
  defineEmits(['update:modelValue', 'blur'])

</script>

<template>
  <div class="sm:col-span-4 w-full ">
    <label :for="name" class="block text-sm font-medium leading-6 text-gray-900 ">{{  label }}</label>
    <div class="mt-2 w-full">
      <div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 w-full ">
        <input :type="type"
              :value="modelValue"
              @input="$emit('update:modelValue', $event.target.value)"
               @blur="$emit('blur', $event.target.value)"
              :name="name" :id="'id' + name" :autocomplete="name"
               class="block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 w-full "
              :placeholder="placeholder" />
      </div>
      <div class="bg-orange-100 border-l-4 border-orange-500 rounded-md text-orange-700 p-4 mt-1" role="alert" v-if="validationError.length">
        <p>{{ validationError }}</p>
      </div>
    </div>
  </div>
<!--  <div class="grid grid-cols-2 items-center justify-end ">-->
<!--    <div class="w-72  ">-->
<!--      <label class="pr-3 ">{{ label }}</label>-->
<!--    </div>-->
<!--    <div>-->
<!--      <input type="text" placeholder="Type here"-->
<!--             :value="modelValue"-->
<!--             @input="$emit('update:modelValue', $event.target.value)"-->
<!--             class="input w-full max-w-xs" />-->
<!--      <input-->
<!--          type="text"-->
<!--          class="w-full input border border-gray:50 input-bordered p-2 m-2 rounded-md"-->
<!--          :value="modelValue"-->
<!--          @input="$emit('update:modelValue', $event.target.value)"-->
<!--          :placeholder="placeholder"-->
<!--      />-->
<!--    </div>-->
<!--  </div>-->

</template>


