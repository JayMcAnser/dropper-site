<script setup lang="ts">
  import {useUserStore} from "~/stores/user";

  const User = useUserStore()

</script>
<template>
  <main
      px-4 py-10
      text="center gray-700 dark:gray-200"
  >
    <!-- Container for demo purpose -->
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- We've used 3xl here, but feel free to try other max-widths based on your needs -->
      <div class="mx-auto max-w-3xl">
        <RouterView />
      </div>
    </div>

<!--    <div class="container my-24 mx-auto md:px-6">-->
<!--      &lt;!&ndash; Section: Design Block &ndash;&gt;-->
<!--      <section class="mb-32 text-center">-->
<!--        <div class="mx-auto max-w-[700px] md:px-3">-->
<!--          <h2 class="mb-12 text-3xl font-bold"><slot name="title"></slot></h2>-->
<!--          <RouterView />-->
<!--        </div>-->
<!--      </section>-->
<!--      &lt;!&ndash; Section: Design Block &ndash;&gt;-->
<!--    </div>-->
    <TheFooter />
    <div mx-auto mt-5 text-center text-sm opacity-50>
      [Dialog Layout] [logged in: {{User.isLoggedIn}}]
    </div>
  </main>
</template>
