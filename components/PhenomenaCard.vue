<template>
  <button type="button" class="
      group
      relative
      flex
      w-full
      min-w-0
      flex-col
      items-center

      rounded-2xl
      border

      px-2
      py-3
      sm:px-3

      text-center

      transition-all
      duration-200

      cursor-pointer
      select-none

      focus:outline-none
      focus-visible:ring-2
      focus-visible:ring-jungle/30
      focus-visible:ring-offset-2

      overflow-hidden
    " :class="selected
      ? [
        'border-jungle',
        'bg-jungle/10',
        'shadow-[0_4px_14px_rgba(39,174,96,0.18)]',
      ]
      : [
        'border-gray-100',
        'bg-white',
        'hover:border-jungle/30',
        'hover:bg-jungle/5',
        'hover:shadow-md',
      ]
      " @click="$emit('select', phenomena)" :aria-pressed="selected" :aria-label="phenomena.name"
    :title="phenomena.name">

    <!-- ================================================
         NOMOR FENOMENA
         ================================================ -->
    <span class="
        absolute
        left-2
        top-1.5

        font-nunito
        text-[10px]
        font-bold
        leading-none

        pointer-events-none
      " :class="selected ? 'text-jungle/50' : 'text-gray-300'" aria-hidden="true">
      {{ phenomena.id }}
    </span>


    <!-- ================================================
         CHECKMARK
         ================================================ -->
    <span v-if="selected" class="
        absolute
        right-1.5
        top-1.5

        flex
        h-5
        w-5
        shrink-0

        items-center
        justify-center

        rounded-full

        bg-jungle

        text-[10px]
        font-bold
        leading-none
        text-white

        shadow-sm
      " aria-hidden="true">
      ✓
    </span>


    <!-- ================================================
         ICON — lebih besar di layar kecil (2 kolom)
         ================================================ -->
    <div class="mt-2 flex h-14 w-14 shrink-0 items-center justify-center sm:h-12 sm:w-12">
      <span class="
          text-[38px]
          sm:text-[30px]
          leading-none
          transition-transform
          duration-200
        " :class="selected ? 'scale-105' : 'group-hover:scale-105'" aria-hidden="true">
        {{ phenomena.icon }}
      </span>
    </div>


    <!-- ================================================
         NAMA FENOMENA — lebih besar & lebih lega di 2 kolom
         ================================================ -->
    <span class="
        mt-2

        w-full
        min-w-0

        px-0.5

        text-center

        font-nunito
        text-[13px]
        sm:text-xs
        font-bold

        leading-[1.3]

        break-words
      " :class="selected ? 'text-jungle' : 'text-gray-700'">
      {{ phenomena.name }}
    </span>


    <!-- ================================================
         DESKRIPSI — tampil penuh tanpa terpotong
         ================================================ -->
    <span v-if="phenomena.description" class="
        mt-1.5

        w-full
        min-w-0

        px-0.5

        text-center

        font-nunito
        text-[11px]
        sm:text-[10px]

        leading-[1.35]

        text-gray-500

        break-words
      ">
      {{ phenomena.description }}
    </span>


    <!-- ================================================
         INDIKATOR TERPILIH
         ================================================ -->
    <span v-if="selected" class="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-jungle/70" aria-hidden="true" />

  </button>
</template>


<script setup>

defineProps({
  phenomena: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['select'])

</script>