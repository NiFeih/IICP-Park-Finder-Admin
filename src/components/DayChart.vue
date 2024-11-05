<script setup>
  import { ref, onMounted } from 'vue';
  import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
  import Chart from 'chart.js/auto';
  import 'chartjs-adapter-date-fns'; // Import the date adapter for Chart.js
  
  const parkingData = ref([]);
  const selectedDate = ref(new Date().toISOString().split('T')[0]); // Default to today's date in YYYY-MM-DD format
  let chartInstance = null; // Variable to hold the chart instance
  
  // Fetch parking data from Firestore
  const fetchParkingData = async () => {
    const db = getFirestore();
    const formattedDate = formatDate(selectedDate.value);
    
    const queryData = query(collection(db, 'ParkingLotData'), where('date', '==', formattedDate));
    const querySnapshot = await getDocs(queryData);
    
    parkingData.value = []; // Clear previous data
    querySnapshot.forEach((doc) => {
      parkingData.value.push(doc.data());
    });
    
    createChart(); // Create the chart after fetching data
  };
  

  const formatDate = (date) => {
    const [year, month, day] = date.split('-'); // Split YYYY-MM-DD
    return `${day}/${month}/${year}`; // Convert to DD/MM/YYYY
  };
  

  const createChart = () => {
    const ctx = document.getElementById('parkingChart').getContext('2d');
  

    const labels = parkingData.value.map(data => {
      const [day, month, year] = data.date.split('/');
      return new Date(`${year}-${month}-${day}T${data.time}:00`).toISOString();
    });
  
    const dataPoints = parkingData.value.map(data => data.availableparkinglot);
  

    if (chartInstance) {
      chartInstance.destroy();
    }
  
    // Initialize the chart
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Available Parking Slots',
          data: dataPoints,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour', 
              displayFormats: {
                hour: 'HH:mm', 
              },
              min: new Date().setHours(0, 0, 0), 
              max: new Date().setHours(23, 59, 59),
            },
            title: {
              display: true,
              text: 'Time of Day',
              font: {
                size: 16,
                
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Available Parking Slots'
            }
          }
        }
      }
    });
  };
  
  onMounted(() => {
    fetchParkingData(); // Fetch data when component is mounted
  });
  </script>

<template>
    <div>
      <label for="dateInput">Select Date:</label>
      <input type="date" id="dateInput" v-model="selectedDate" @change="fetchParkingData" />
      <canvas class="bg-white" id="parkingChart"></canvas>
    </div>
  </template>
  
  
  
  <style scoped>
  /* Add any styles you need for your chart */
  #parkingChart {
    width: 100%;
    height: 400px; /* Adjust height as needed */
  }
  </style>