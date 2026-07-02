<script setup>
import SealMark from '../SealMark.vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { LACRES } from '../../config/options.js';
import { LIMITS } from '../../config/schema.js';

const { form } = useLetterDraft();
</script>

<template>
  <!-- os ícones usam a cor de lacre escolhida -->
  <div class="ed-panel" :style="{ '--heart-color': form.cores.lacre }">
    <div class="ed-tiles">
      <label v-for="o in LACRES" :key="o.id" class="ed-tile">
        <input v-model="form.lacre" type="radio" name="lacre" :value="o.id" />
        <span class="ed-tile-body">
          <span class="pv pv-lacre">
            <SealMark :forma="o.id" :inicial="o.id === 'inicial' ? form.inicial || 'A' : ''" />
          </span>
          <span>{{ o.nome }}</span>
        </span>
      </label>
    </div>

    <div v-if="form.lacre === 'inicial'" class="ed-group">
      <label class="ed-row">
        <span class="lbl">Letra(s)</span>
        <input v-model="form.inicial" type="text" :maxlength="LIMITS.inicial" placeholder="M" />
      </label>
    </div>
  </div>
</template>
