<script setup>
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { ESTAMPAS, POSTAIS } from '../../config/options.js';
import { LIMITS } from '../../config/schema.js';

const { form } = useLetterDraft();
</script>

<template>
  <!-- as miniaturas de estampa usam as cores atuais do envelope e do lacre -->
  <div class="ed-panel" :style="{ '--env-cover': form.cores.envelope, '--heart-color': form.cores.lacre }">
    <div class="ed-group">
      <label class="ed-row">
        <span class="lbl">Dedicatória</span>
        <input v-model="form.para" type="text" :maxlength="LIMITS.para" placeholder="Para Maria" />
      </label>
    </div>

    <h3 class="ed-sub">Estampa</h3>
    <div class="ed-tiles ed-tiles-sm">
      <label v-for="o in ESTAMPAS" :key="o.id || 'lisa'" class="ed-tile">
        <input v-model="form.estampa" type="radio" name="estampa" :value="o.id" />
        <span class="ed-tile-body">
          <span class="pv pv-est"><i v-if="o.id" class="f-estampa" :class="`est-${o.id}`"></i></span>
          <span>{{ o.nome }}</span>
        </span>
      </label>
    </div>

    <h3 class="ed-sub">Selo postal</h3>
    <div class="ed-strip" role="radiogroup" aria-label="Selo postal">
      <label class="ed-sticker">
        <input v-model="form.postal" type="radio" name="postal" value="" aria-label="Sem selo" />
        <span>✕</span>
      </label>
      <label v-for="e in POSTAIS" :key="e" class="ed-sticker">
        <input v-model="form.postal" type="radio" name="postal" :value="e" :aria-label="e" />
        <span>{{ e }}</span>
      </label>
    </div>
    <p class="ed-foot">Os adesivos ficam na aba Adesivo.</p>
  </div>
</template>
