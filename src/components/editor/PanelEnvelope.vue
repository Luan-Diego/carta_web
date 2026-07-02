<script setup>
import { ref } from 'vue';
import { useLetterDraft } from '../../composables/useLetterDraft.js';
import { ADESIVOS, ESTAMPAS, STICKER_SIZE } from '../../config/options.js';
import { LIMITS } from '../../config/schema.js';
import { toSticker } from '../../lib/image.js';

const { form } = useLetterDraft();
const erro = ref('');

const temAdesivo = () => Boolean(form.adesivoImg || form.adesivo);

// escolher um emoji (ou "nenhum") troca o adesivo próprio
function escolher(emoji) {
  form.adesivo = emoji;
  form.adesivoImg = '';
}

async function enviar(e) {
  erro.value = '';
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  const r = await toSticker(file);
  if (r.erro) {
    erro.value = r.erro;
    return;
  }
  form.adesivoImg = r.dataUrl;
  form.adesivo = '';
}
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
      <label v-for="e in ADESIVOS.slice(1)" :key="e" class="ed-sticker">
        <input v-model="form.postal" type="radio" name="postal" :value="e" :aria-label="e" />
        <span>{{ e }}</span>
      </label>
    </div>

    <h3 class="ed-sub">Adesivo</h3>
    <div class="ed-stickers" role="radiogroup" aria-label="Adesivo">
      <label class="ed-sticker">
        <input type="radio" name="adesivo" aria-label="Nenhum" :checked="!temAdesivo()" @change="escolher('')" />
        <span>✕</span>
      </label>
      <label class="ed-sticker ed-upload" title="Usar um PNG seu">
        <input type="file" accept="image/png,image/webp,image/jpeg,image/gif" aria-label="Enviar adesivo próprio" @change="enviar" />
        <span :class="{ on: form.adesivoImg }">
          <img v-if="form.adesivoImg" :src="form.adesivoImg" alt="" />
          <template v-else>＋</template>
        </span>
      </label>
      <label v-for="e in ADESIVOS.slice(1)" :key="e" class="ed-sticker">
        <input type="radio" name="adesivo" :aria-label="e" :checked="form.adesivo === e && !form.adesivoImg" @change="escolher(e)" />
        <span>{{ e }}</span>
      </label>
    </div>
    <p v-if="erro" class="ed-error" role="alert">{{ erro }}</p>
    <p v-else class="ed-foot">O "＋" envia um PNG seu (com fundo transparente fica melhor). Ele é reduzido para caber no link.</p>

    <div v-if="temAdesivo()" class="ed-group">
      <label class="ed-row">
        <span class="lbl">Tamanho</span>
        <input v-model.number="form.adesivoTam" class="ed-range" type="range" :min="STICKER_SIZE.min" :max="STICKER_SIZE.max" step="5" aria-label="Tamanho do adesivo" />
        <span class="ed-val">{{ form.adesivoTam }}%</span>
      </label>
    </div>
    <button v-if="form.adesivoImg" type="button" class="ed-glassbtn" @click="escolher('')">Remover meu adesivo</button>
  </div>
</template>
