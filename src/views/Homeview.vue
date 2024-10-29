<script setup>
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const activeTab = ref('day')
const chartRef = ref(null)
let chart = null

const tabs = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' }
]

const chartData = {
  day: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [12, 19, 3, 5, 2, 3, 7]
  },
  week: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    data: [65, 59, 80, 81]
  },
  month: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [33, 25, 35, 51, 54, 76]
  }
}

function changeTab(tabId) {
  activeTab.value = tabId
  updateChart()
}

function updateChart() {
  const ctx = chartRef.value.getContext('2d')
  
  if (chart) {
    chart.destroy()
  }
  
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData[activeTab.value].labels,
      datasets: [{
        label: 'Statistics',
        data: chartData[activeTab.value].data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

onMounted(() => {
  updateChart()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center">Statistics Dashboard</h1>
    
    <div class="mb-6">
      <ul class="flex border-b">
        <li v-for="tab in tabs" :key="tab.id" class="-mb-px mr-1">
          <a :class="['inline-block py-2 px-4 font-semibold', 
                      activeTab === tab.id ? 'border-l border-t border-r rounded-t text-blue-700' : 'text-blue-500 hover:text-blue-800']"
             @click="changeTab(tab.id)">
            {{ tab.label }}
          </a>
        </li>
      </ul>
    </div>
    
    <div class="bg-white shadow-md rounded p-4">
      <canvas ref="chartRef" height="400"></canvas>
    </div>
  </div>
</template>
