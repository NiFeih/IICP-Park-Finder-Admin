<script setup>
import DeleteFineModal from '@/components/DeleteFineModal.vue'
import FineModal from '@/components/FineModal.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import EditFineModal from '@/components/EditFineModal.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

const db = getFirestore()
const router = useRouter()
const plateNumber = ref(router.currentRoute.value.params.carPlate)
const carPlateNumber = ref('')
const userInformation = ref({})
const fines = ref([])
const selectedFine = ref(null)
const openFineModal = ref(false)
const openPaymentModal = ref(false)
const openEditFineModal = ref(false)
const openDeleteFineModal = ref(false)
const fineToDelete = ref(null)
const successMessage = ref('') // State for success message

async function getOwnerDetails() {
  const userId = ref('')
  const ownerQuery = query(
    collection(db, 'CarPlateNumbers'),
    where('plateNumber', '==', plateNumber.value),
  )
  const ownerQuerySnapshot = await getDocs(ownerQuery)
  userId.value = ownerQuerySnapshot.docs[0].data().userId
  const userQuery = query(
    collection(db, 'Users'),
    where('uid', '==', userId.value),
  )
  const userQuerySnapshot = await getDocs(userQuery)
  userInformation.value = userQuerySnapshot.docs[0].data()
}

async function fetchFines() {
  const finesQuery = query(
    collection(db, 'Fines'),
    where('plateNumber', '==', plateNumber.value),
  )
  const finesQuerySnapshot = await getDocs(finesQuery)

  // Fetch fines and sort them based on the combined date and time fields
  fines.value = finesQuerySnapshot.docs
    .map(doc => ({
      ...doc.data(),
      id: doc.id,
      // Combine date and time to create a Date object
      combinedDate: new Date(`${doc.data().date} ${doc.data().time}`),
    }))
    .sort((a, b) => {
      return b.combinedDate - a.combinedDate // Sort from latest to oldest
    })
}

async function openPayModal(fine) {
  try {
    // Get the user ID associated with the car plate number from CarPlateNumbers
    const carPlateQuery = query(
      collection(db, 'CarPlateNumbers'),
      where('plateNumber', '==', fine.plateNumber),
    )
    const carPlateSnapshot = await getDocs(carPlateQuery)

    if (!carPlateSnapshot.empty) {
      const userId = carPlateSnapshot.docs[0].data().userId

      // Get the student ID from the Users collection
      const userQuery = query(
        collection(db, 'Users'),
        where('uid', '==', userId),
      )
      const userSnapshot = await getDocs(userQuery)

      if (!userSnapshot.empty) {
        const studentID = userSnapshot.docs[0].data().studentID

        // Set up the fine details with the fetched student ID
        selectedFine.value = {
          ...fine, // Include other properties from the original fine object
          studentID: studentID, // Attach the retrieved student ID here
        }

        openPaymentModal.value = true
      } else {
        console.error('User not found for given userId')
      }
    } else {
      console.error('Car plate number not found')
    }
  } catch (error) {
    console.error('Error fetching studentID:', error)
  }
}

function openEditModal(fine) {
  selectedFine.value = fine
  openEditFineModal.value = true
}

async function openDeleteModal(fine) {
  try {
    // Get the user ID associated with the car plate number from CarPlateNumbers
    const carPlateQuery = query(
      collection(db, 'CarPlateNumbers'),
      where('plateNumber', '==', fine.plateNumber),
    )
    const carPlateSnapshot = await getDocs(carPlateQuery)

    if (!carPlateSnapshot.empty) {
      const userId = carPlateSnapshot.docs[0].data().userId

      // Get the student ID from the Users collection
      const userQuery = query(
        collection(db, 'Users'),
        where('uid', '==', userId),
      )
      const userSnapshot = await getDocs(userQuery)

      if (!userSnapshot.empty) {
        const studentID = userSnapshot.docs[0].data().studentID

        // Set up the fine details with the fetched student ID
        fineToDelete.value = {
          id: fine.id,
          plateNumber: fine.plateNumber,
          studentId: studentID, // Attach the retrieved student ID here
        }

        openDeleteFineModal.value = true
      } else {
        console.error('User not found for given userId')
      }
    } else {
      console.error('Car plate number not found')
    }
  } catch (error) {
    console.error('Error fetching studentID:', error)
  }
}
function showSuccessMessage(message) {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000) // Clears the message after 3 seconds
}

onMounted(async () => {
  await getOwnerDetails()
  await fetchFines()
})
</script>

<template>
  <div class="container mx-auto mt-10">
    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="bg-green-100 text-green-800 p-3 rounded-md mb-4"
    >
      {{ successMessage }}
    </div>

    <div class="flex justify-center items-center"></div>
    <div>
      <RouterLink
        to="/searchCarPlate"
        class="text-blue-600 hover:underline flex flex-row gap-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 512 512"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="48"
            d="M244 400L100 256l144-144M120 256h292"
          />
        </svg>
        Back
      </RouterLink>
    </div>
    <div class="flex justify-center items-center mt-10 gap-x-10">
      <div class="w-80 bg-white rounded-lg border border-slate-200 shadow-lg">
        <form class="px-10 py-10 space-y-2">
          <h1 class="text-xl font-semibold">Owner Information</h1>
          <div class="flex flex-col space-y-2">
            <label class="text-sm">Car Plate Number</label>
            <input
              type="text"
              class="border border-black rounded-lg p-2"
              v-model="plateNumber"
              disabled
            />
          </div>
          <div class="flex flex-col space-y-2">
            <label class="text-sm">Email</label>
            <input
              type="email"
              class="border border-black rounded-lg p-2"
              v-model="userInformation.email"
              disabled
            />
          </div>
          <div class="flex flex-col space-y-2">
            <label class="text-sm">Phone Number</label>
            <input
              type="text"
              class="border border-black rounded-lg p-2"
              v-model="userInformation.contact"
              disabled
            />
          </div>
        </form>
      </div>
      <div
        class="w-4/5 h-[500px] bg-white rounded-lg border border-slate-200 shadow-lg space-y-2 px-10"
      >
        <div class="flex items-center justify-between mt-6">
          <h1 class="text-lg font-semibold">Fines</h1>
          <button
            @click="openFineModal = true"
            class="p-2 flex items-center space-x-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            Fine
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
              />
            </svg>
          </button>
        </div>

        <div class="overflow-y-auto h-[350px] w-full">
          <table class="table-auto bg-white shadow-md rounded-lg w-full">
            <thead class="bg-slate-200">
              <tr>
                <th>Car Plate Number</th>
                <th>Car Park Level</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Time</th>
                <th>Payment</th>
                <th>Reciept</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody class="text-center" v-if="fines.length !== 0">
              <tr class="p-2" v-for="(fine, index) in fines" :key="index">
                <td class="flex items-center gap-2 px-2">
                  <button @click="openEditModal(fine)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M3 21v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM17.6 7.8L19 6.4L17.6 5l-1.4 1.4z"
                      />
                    </svg>
                  </button>
                  {{ fine.plateNumber }}
                </td>
                <td>{{ fine.carParkLevel }}</td>
                <td>{{ fine.reason }}</td>
                <td>{{ fine.date }}</td>
                <td>{{ fine.time }}</td>
                <td v-if="fine.paid === true">
                  <p>Paid</p>
                </td>
                <td v-else>
                  <button
                    class="text-blue-600 hover:underline hover:underline-offset-1"
                    @click="openPayModal(fine)"
                  >
                    Pay
                  </button>
                </td>
                <td v-if="fine.receipt">
                  <a
                    :href="fine.receipt"
                    target="_blank"
                    class="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </td>
                <td v-else>No Reciept</td>
                <td>
                  <button @click="openDeleteModal(fine)" class="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody class="text-center" v-else>
              <tr>
                <td colspan="7">No fines record</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <FineModal
      :isOpen="openFineModal"
      :plateNumber="plateNumber"
      @close="openFineModal = false"
    />
    <PaymentModal
      :isOpen="openPaymentModal"
      :fineId="fineId"
      :fine="selectedFine"
      @close="openPaymentModal = false"
    />
    <EditFineModal
      v-if="openEditFineModal"
      :fine="selectedFine"
      @close="openEditFineModal = false"
    />
    <DeleteFineModal
      :isOpen="openDeleteFineModal"
      :fineId="fineToDelete?.id"
      :plateNumber="fineToDelete?.plateNumber"
      :studentId="fineToDelete?.studentId"
      @close="openDeleteFineModal = false"
      @deleted="
        () => {
          fetchFines()
          showSuccessMessage('Fine deleted successfully')
        }
      "
    />
  </div>
</template>

<style lang="scss" scoped></style>
