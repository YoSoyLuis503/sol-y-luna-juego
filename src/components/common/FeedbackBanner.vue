<script setup lang="ts">
import type { FeedbackState } from '@/types/game'

const { feedback } = defineProps<{
  feedback: FeedbackState | null
}>()
</script>

<template>
  <div v-if="feedback" class="feedback-banner" :class="`is-${feedback.kind}`" role="status">
    <span class="feedback-badge" aria-hidden="true">
      <svg v-if="feedback.kind === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <svg v-else-if="feedback.kind === 'hint'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15 9 22 9 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9 9 9" />
      </svg>
    </span>
    <p class="feedback-text">{{ feedback.text }}</p>
  </div>
</template>

<style scoped>
.feedback-banner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.72rem 1.05rem;
  border-radius: 18px;
  border: 2px solid transparent;
  font-weight: 700;
  font-size: 0.98rem;
  box-shadow: var(--shadow-paper-sm);
  transition: background-color 180ms ease, border-color 180ms ease;
}

.feedback-banner.is-success {
  background-color: #E3F7EB;
  border-color: #77C596;
  color: #1B5432;
}

.feedback-banner.is-hint {
  background-color: #FFF2D8;
  border-color: #E6B760;
  color: #5C3D05;
}

.feedback-banner.is-info {
  background-color: #E6F4F7;
  border-color: #82C2CC;
  color: #164C54;
}

.feedback-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}

.feedback-text {
  line-height: 1.35;
}
</style>
