<template>
  <div>
    <label for="monthInput">Select Month:</label>
    <select id="monthInput" v-model="selectedMonth" @change="fetchParkingData">
      <option v-for="month in months" :key="month.value" :value="month.value">
        {{ month.name }}
      </option>
    </select>

    <label for="yearInput">Select Year:</label>
    <select id="yearInput" v-model="selectedYear" @change="fetchParkingData">
      <option v-for="year in years" :key="year">{{ year }}</option>
    </select>

    <canvas class="bg-white" id="parkingChart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns' // Import the date adapter for Chart.js

const parkingData = ref([])
const selectedMonth = ref(new Date().getMonth() + 1) // Default to current month (1-12)
const selectedYear = ref(new Date().getFullYear()) // Default to current year

let chartInstance = null

const months = [
  { value: 1, name: 'January' },
  { value: 2, name: 'February' },
  { value: 3, name: 'March' },
  { value: 4, name: 'April' },
  { value: 5, name: 'May' },
  { value: 6, name: 'June' },
  { value: 7, name: 'July' },
  { value: 8, name: 'August' },
  { value: 9, name: 'September' },
  { value: 10, name: 'October' },
  { value: 11, name: 'November' },
  { value: 12, name: 'December' },
]

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}
// Fetch parking data from Firestore
const fetchParkingData = async () => {
  const db = getFirestore()

  const startDate = new Date(selectedYear.value, selectedMonth.value - 1, 1)
  const endDate = new Date(
    selectedYear.value,
    selectedMonth.value - 1,
    getDaysInMonth(selectedYear.value, selectedMonth.value),
  )
  const formattedStartDate = formatDate(startDate)
  const formattedEndDate = formatDate(endDate)
  const queryData = query(
    collection(db, 'ParkingLotData'),
    //where('date','==','10/09/2024'),
    where('date', '>=', formattedStartDate),
    where('date', '<=', formattedEndDate),
  )

  const querySnapshot = await getDocs(queryData)

  parkingData.value = []
  querySnapshot.forEach(doc => {
    parkingData.value.push(doc.data())
  })

  console.log(parkingData.value)

  createChart()
}

const formatDate = date => {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

const calculateAverages = data => {
  const groupedData = {}

  data.forEach(entry => {
    const date = entry.date
    if (!groupedData[date]) {
      groupedData[date] = []
    }
    groupedData[date].push(entry.availableparkinglot)
  })

  // Calculate averages
  return Object.keys(groupedData).map(date => {
    const total = groupedData[date].reduce((sum, value) => sum + value, 0)
    const average = total / groupedData[date].length
    const roundedAverage = Math.round(average)

    return { date, roundedAverage }
  })
}

// Create the line chart
const createChart = () => {
  const ctx = document.getElementById('parkingChart').getContext('2d')

  const averages = calculateAverages(parkingData.value)
  console.log(averages)
  const labels = averages.map(data => {
    const [day, month, year] = data.date.split('/')
    return new Date(`${year}-${month}-${day}T00:00:00`).toISOString()
  })
  const dataPoints = averages.map(data => data.roundedAverage)
  console.log(labels)
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `Average Available Parking Slots in ${months[selectedMonth.value - 1].name} ${selectedYear.value}`,
          data: dataPoints,
          borderColor: 'rgba(75,192,192,1)',
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              day: 'dd',
            },
          },
          title: {
            display: true,
            text: 'Date',
          },
          min: new Date(
            selectedYear.value,
            selectedMonth.value - 1,
            1,
          ).toISOString(),
          max: new Date(
            selectedYear.value,
            selectedMonth.value,
            0,
          ).toISOString(),
        },
        y: {
          title: {
            display: true,
            text: 'Average Available Parking Slots',
          },
          min: 0,
          max: 100,
        },
      },
    },
  })
}

onMounted(() => {
  fetchParkingData()
})
</script>

<style scoped>
#parkingChart {
  width: 100%;
  height: 400px;
}
</style>
