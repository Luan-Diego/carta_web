<script setup>
import '../styles/decor.css';

// Decorações sobre uma superfície (papel ou envelope). As posições são em %,
// por isso aparecem no mesmo lugar no papel 3D, na leitura e no editor.
// Com `editavel`, cada item pode ser arrastado e selecionado.
defineProps({
  itens: { type: Array, default: () => [] }, // [{ e | i, x, y, s, r }]
  imgs: { type: Array, default: () => [] }, // visual.decorImgs
  editavel: { type: Boolean, default: false },
  sel: { type: Number, default: -1 },
});
const emit = defineEmits(['down']);
</script>

<template>
  <div v-if="itens.length || editavel" class="pd-camada pd-decor" :class="{ 'pd-edit': editavel }" :aria-hidden="editavel ? null : 'true'">
    <template v-for="(d, n) in itens" :key="n">
      <img
        v-if="d.i !== undefined && imgs[d.i]"
        class="pd-item pd-item-img"
        :class="{ sel: editavel && sel === n }"
        :src="imgs[d.i]"
        :style="{ '--x': d.x, '--y': d.y, '--s': d.s, '--r': d.r + 'deg' }"
        alt=""
        draggable="false"
        @pointerdown="editavel && emit('down', $event, n)"
      />
      <span
        v-else-if="d.e"
        class="pd-item"
        :class="{ sel: editavel && sel === n }"
        :style="{ '--x': d.x, '--y': d.y, '--s': d.s, '--r': d.r + 'deg' }"
        @pointerdown="editavel && emit('down', $event, n)"
      >{{ d.e }}</span>
    </template>
  </div>
</template>
