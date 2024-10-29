<script setup>
import { ref, onMounted,computed} from 'vue'
import { useRouter } from 'vue-router'
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const searchInput = ref('')
const selectedSearchBy = ref('Car Plate Number')
const isLoading = ref(false)
const recentSearches = ref([])
const db = getFirestore()
const router = useRouter()
const studentAndPlateNumbers = ref(null)

async function handleSearch() {
  if (!searchInput.value) {
    alert('Please enter a car plate number')
    return
  }
  
  isLoading.value = true
  const carPlateQuery = query(collection(db,'CarPlateNumbers'), where('plateNumber', '==', carPlateNumber.value));
  const carPlateQuerySnapshot = await getDocs(carPlateQuery);
  isLoading.value = false
  
  if (carPlateQuerySnapshot.empty) {
    alert('Car Plate Number not found')
  } else {
    addToRecentSearches(carPlateNumber.value)
    router.push({ name: "ownerDetails", params: { carPlate: carPlateNumber.value } });
  }
}

function navigateToOwnerDetails(plate) {
  router.push({ name: "ownerDetails", params: { carPlate: plate } });
}
async function fetchCarPlateNumbers(){
    const plate_numbers = []
    const carPlateQuery = query(collection(db,'CarPlateNumbers'))
    const carPlateQuerySnapshot = await getDocs(carPlateQuery)
    carPlateQuerySnapshot.forEach(doc => {
        plate_numbers.push({
            id: doc.id,
            ...doc.data()
        })
    })
    return plate_numbers
}
async function fetchStudentDetails(){
    const students = []
    const studentQuery = query(collection(db,'Users'),where('role','==','student'))
    const studentQuerySnapshot = await getDocs(studentQuery)
    studentQuerySnapshot.forEach(doc => {
        students.push({
            id: doc.id,
            ...doc.data()
        })
    })
    console.log(students)
    return students
}
async function fetchStudentDetailsWithPlateNumbers(){
    const plate_numbers = await fetchCarPlateNumbers()
    const students = await fetchStudentDetails()
    return plate_numbers.map(plate_number =>({
        ...plate_number,
        student: students.find(student => student.uid === plate_number.userId)
    }))

}
const filteredData = computed(() => {
  if (!searchInput.value) return studentAndPlateNumbers.value
    if (selectedSearchBy.value === 'Student ID') {
        return studentAndPlateNumbers.value.filter(data => data.student.studentID.toLowerCase().includes(searchInput.value.toLowerCase()))
    }else if (selectedSearchBy.value === 'Car Plate Number') {
        return studentAndPlateNumbers.value.filter(data => data.plateNumber.toLowerCase().includes(searchInput.value))
    }
})

function addToRecentSearches(plate) {
  recentSearches.value = [plate, ...recentSearches.value.filter(p => p !== plate)].slice(0, 5)
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}


onMounted(async () => {
 studentAndPlateNumbers.value = await fetchStudentDetailsWithPlateNumbers()
  
})
</script>

<template>
  <div class="flex flex-col items-center min-h-screen  p-4">
    <h1 class="text-3xl font-bold mb-8 text-blue-600">Students</h1>
    <form class="flex items-center mb-6" @submit.prevent="handleSearch">
        <select class="border-2 rounded-lg px-3 py-2" v-model="selectedSearchBy">
            <option value="Car Plate Number">Car Plate Number</option>
            <option value="Student ID">Student ID</option>
        </select>
      <input
        type="text"
        class="border-2 rounded-lg py-2 px-4 w-64 focus:outline-none focus:border-blue-700"
        placeholder=""
        v-model="searchInput"
      />
    
    </form>
    <table class="table-auto w-full max-w-2xl bg-white px-4">
        <thead class="bg-slate-500 text-white">
            <tr>
                <th>Plate Number</th>
                <th>Student ID</th>
                <th>Contact</th>
                <th>Email</th>
                <th></th>

            </tr>
        </thead>
        <tbody class="text-center bg-white border-2"  v-if="filteredData != 0 ">
            <tr  v-for="(data ,index) in filteredData" :key=index class="hover:bg-slate-200" >
               
                <td class="border-b border-gray-300">{{ data.plateNumber }}</td>
                <td class="border-b border-gray-300" v-if="data.student" >{{ data.student.studentID}}</td>
                <td class="border-b border-gray-300" v-if="data.student" >{{ data.student.contact }}</td>
                <td class="border-b border-gray-300" v-if="data.student" >{{ data.student.email }}</td>
                <td class="border-b border-gray-300 px-2" ><button @click="navigateToOwnerDetails(data.plateNumber)"> Go</button></td>
               
            </tr>
           
        </tbody>
        <tbody v-else>
            <tr>
                <td colspan="6" class="text-center">No data found</td>
            </tr>
        </tbody>
    </table>
    
  </div>
</template>

<style>

</style>