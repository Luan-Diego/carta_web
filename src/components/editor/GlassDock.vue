<script setup>
import '../../styles/dock.css';

// Dock de vidro: um botão por opção de personalização.
defineProps({
  secoes: { type: Array, required: true }, // [{ id, nome, curto? }]
  ativa: { type: String, default: null },
});
defineEmits(['select']);
</script>

<template>
  <nav class="ed-dock" aria-label="Personalizar a carta">
    <button
      v-for="s in secoes"
      class="ed-app"
      :data-id="s.id"
      :aria-label="s.nome"
      :key="s.id"
      type="button"
      :aria-expanded="ativa === s.id ? 'true' : 'false'"
      @click="$emit('select', s.id)"
    >
      <span class="ed-app-icon"><svg viewBox="0 0 24 24" aria-hidden="true">
        <template v-if="s.id === 'mensagem'">
          <path d="M5 7h14M5 12h14M5 17h9" />
        </template>
        <template v-else-if="s.id === 'cores'">
          <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.5 0 2.1-1 1.7-2.2-.5-1.2.3-2.3 1.6-2.3H17a3.5 3.5 0 0 0 3.5-3.5C20.5 7 16.8 3.5 12 3.5z" />
          <circle cx="7.8" cy="11.2" r="1" />
          <circle cx="10.6" cy="7.4" r="1" />
          <circle cx="15.2" cy="7.8" r="1" />
        </template>
        <template v-else-if="s.id === 'fundo'">
          <rect x="3.5" y="4.5" width="17" height="15" rx="3.5" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M4 17l5-4.5 3.5 3L16 12l4 4" />
        </template>
        <template v-else-if="s.id === 'lacre'">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 16.6s-4-2.4-4-5.2A2.2 2.2 0 0 1 12 10a2.2 2.2 0 0 1 4 1.4c0 2.8-4 5.2-4 5.2z" />
        </template>
        <template v-else-if="s.id === 'envelope'">
          <rect x="3.5" y="6" width="17" height="12" rx="2.8" />
          <path d="M4 8l8 5.5L20 8" />
        </template>
        <template v-else-if="s.id === 'papel'">
          <path d="M7 3.5h7l4 4v13H7z" />
          <path d="M14 3.5v4h4" />
          <path d="M10 13h5M10 16.5h3" />
        </template>
        <template v-else-if="s.id === 'adesivo'">
          <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5h.5L20.5 11.5z" />
          <path d="M12.5 3.5v5a3 3 0 0 0 3 3h5" />
          <circle cx="9" cy="11" r="1" />
          <path d="M8.5 15c1 1 2 1.5 3 1.5" />
        </template>
        <template v-else>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </template>
      </svg></span>
      <span class="ed-app-name" aria-hidden="true">{{ s.curto ?? s.nome }}</span>
    </button>
  </nav>
</template>
