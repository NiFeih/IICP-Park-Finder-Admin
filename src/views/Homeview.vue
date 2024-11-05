<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import DayChart from '@/components/DayChart.vue';
import MonthChart from '@/components/MonthChart.vue';

const activeTab = ref('day')
const tabs = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' }
]

function changeTab(tabId) {
  activeTab.value = tabId
  
}

</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center">Statistics Dashboard</h1>
    
    <div class="mb-6">
      <ul class="flex border-b">
        <li v-for="tab in tabs" :key="tab.id" class="mb-px mr-1">
          <a :class="['inline-block py-2 px-4 font-semibold', 
                      activeTab === tab.id ? 'border-l border-t border-r rounded-t text-blue-700' : 'text-blue-500 hover:text-blue-800']"
             @click="changeTab(tab.id)">
            {{ tab.label }}
          </a>
        </li>
      </ul>
    </div>

    <DayChart v-if="activeTab === 'day'" />
  <MonthChart v-else-if="activeTab === 'month'" />
  </div>
</template>
