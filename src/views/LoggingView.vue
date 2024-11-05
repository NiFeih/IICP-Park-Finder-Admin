<template>
  <div class="flex flex-col items-center min-h-screen p-4">
    <!-- Header Section -->
    <h1 class="text-3xl font-bold mb-8 text-blue-600">Log Details</h1>

    <!-- Search Bar Section -->
    <form class="flex items-center mb-6" @submit.prevent="handleSearch">
      <select class="border-2 rounded-lg px-3 py-1" v-model="selectedSearchBy">
        <option value="Car Plate Number">Car Plate Number</option>
        <option value="Student ID">Student ID</option>
      </select>
      <input
        type="text"
        class="border-2 rounded-lg py-1 px-4 w-64 focus:outline-none focus:border-blue-700"
        placeholder="Enter search query"
        v-model="searchInput"
      />
    </form>

    <!-- Table Section -->
    <table class="table-auto w-full max-w-2xl bg-white px-4">
      <thead class="bg-slate-500 text-white">
        <tr>
          <th class="py-1">Plate Number</th>
          <th class="py-1">Student ID</th>
          <th class="py-1">Date</th>
          <th class="py-1">Time</th>
          <th class="py-1">Action</th>
        </tr>
      </thead>
      <tbody class="text-center bg-white border-2" v-if="filteredLogs.length">
        <tr
          v-for="(log, index) in filteredLogs"
          :key="index"
          class="hover:bg-slate-200"
        >
          <td class="border-b border-gray-300 py-1 px-6">
            {{ log.plateNumber }}
          </td>
          <td class="border-b border-gray-300 py-1 px-6">
            {{ log.studentID }}
          </td>
          <td class="border-b border-gray-300 py-1 px-6">{{ log.date }}</td>
          <td class="border-b border-gray-300 py-1 px-6">{{ log.time }}</td>
          <td class="border-b border-gray-300 py-1 px-6">{{ log.action }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="text-center py-4 text-gray-500">
            No data found
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const logs = ref([])
const searchInput = ref('')
const selectedSearchBy = ref('Car Plate Number') // Default search option
const db = getFirestore()

// Fetch logs data from Firebase
async function fetchLogs() {
  const loggingCollection = collection(db, 'Logging')
  const loggingSnapshot = await getDocs(loggingCollection)

  logs.value = loggingSnapshot.docs
    .map(doc => doc.data())
    .sort((a, b) => {
      // Sort by date and time in descending order
      const dateA = new Date(`${a.date} ${a.time}`)
      const dateB = new Date(`${b.date} ${b.time}`)
      return dateB - dateA
    })
}

// Filtered logs based on search input
const filteredLogs = computed(() => {
  if (!searchInput.value) return logs.value

  return logs.value.filter(log => {
    if (selectedSearchBy.value === 'Car Plate Number') {
      return log.plateNumber
        .toLowerCase()
        .includes(searchInput.value.toLowerCase())
    } else if (selectedSearchBy.value === 'Student ID') {
      return log.studentID
        .toLowerCase()
        .includes(searchInput.value.toLowerCase())
    }
    return false
  })
})

onMounted(() => {
  fetchLogs()
})
</script>
