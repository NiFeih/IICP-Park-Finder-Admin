<script setup>
import { toRaw, watch } from 'vue'
import { ref, reactive } from 'vue'
import { defineEmits } from 'vue'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore'

const db = getFirestore()
const props = defineProps({
  isOpen: Boolean,
  plateNumber: String,
})

const carParkLevels = ['Basement', '1', '2']
const date = new Date()
const fine = reactive({
  plateNumber: props.plateNumber,
  carParkLevel: '',
  reason: '',
  date: date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }),
  time: date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
})

const emit = defineEmits(['close', 'fine-added'])

watch(
  () => props.isOpen,
  newValue => {
    if (newValue) {
      // Reset fine object when modal is opened
      fine.plateNumber = props.plateNumber
      fine.carParkLevel = ''
      fine.reason = ''
    }
  },
)

async function submitFine() {
  console.log('Submit Fine function called') // Debug log
  console.log(fine) // Log the fine object to ensure it has correct data

  try {
    fine.paid = false // Set paid to false
    const docRef = await addDoc(collection(db, 'Fines'), fine)
    console.log('Fine added to database', docRef.id) // Confirm fine is added

    const carPlateQuery = query(
      collection(db, 'CarPlateNumbers'),
      where('plateNumber', '==', fine.plateNumber),
    )

    const querySnapshot = await getDocs(carPlateQuery)
    if (!querySnapshot.empty) {
      const carPlateDoc = querySnapshot.docs[0]

      await updateDoc(doc(db, 'CarPlateNumbers', carPlateDoc.id), {
        lock: true,
      })
      console.log('Car plate updated to locked') // Confirm car plate is updated

      const userId = carPlateDoc.data().userId // Assuming you store user ID in CarPlateNumbers collection
      const notificationMessage = `${fine.plateNumber} has been clamped for ${fine.reason} at Level ${fine.carParkLevel}. \n \nPlease head to the AFM office to unclamp your vehicle.`

      const notificationData = {
        message: notificationMessage,
        read: false,
        sent: true,
        timestamp: Timestamp.now(), // Use Firestore's Timestamp for the current time
        title: 'Your Vehicle has Been Clamped',
        uid: userId,
      }

      await addDoc(collection(db, 'Notifications'), notificationData)
      console.log('Notification added for car owner') // Confirm notification is added
    }

    await setDoc(docRef, { id: docRef.id }, { merge: true })
    closeModal()
    window.location.reload()
  } catch (error) {
    console.error('Error adding fine or notification:', error) // Catch any errors
  }
}

// // Utility function to format the timestamp
// function formatTimestamp(date) {
//   const options = {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//     hour12: true,
//     timeZone: 'Asia/Singapore', // Adjust to your desired timezone
//     timeZoneName: 'short', // This will include the UTC+8 format
//   }
//   return new Intl.DateTimeFormat('en-US', options).format(date)
// }

const closeModal = () => {
  emit('close')
  Object.keys(fine).forEach(key => (fine[key] = ''))
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
  >
    <div class="p-8 border w-96 shadow-lg rounded-md bg-white">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Fine</h3>
      <form @submit.prevent="submitFine" class="space-y-4">
        <div>
          <label for="carPlate" class="block text-sm font-medium text-gray-700">
            Car Plate Number
          </label>
          <input
            v-model="fine.plateNumber"
            type="text"
            id="carPlate"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled
          />
        </div>
        <div>
          <label
            for="carParkLevel"
            class="block text-sem font-medium text-gray-700"
          >
            Car Park Level
          </label>
          <select
            v-model="fine.carParkLevel"
            id="carParkLevel"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option v-for="level in carParkLevels" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>
        <div>
          <label for="reason" class="block text-sm font-medium text-gray-700">
            Reason
          </label>
          <select
            v-model="fine.reason"
            id="reason"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="" disabled>Select a reason</option>
            <option value="Double Parking">Double Parking</option>
            <option value="Not Parking Within Parking Lot">
              Not Parking Within Parking Lot
            </option>
            <option value="Parking in Reserved/OKU Lot">
              Parking in Reserved/OKU Lot
            </option>
            <option value="Overnight Parking">Overnight Parking</option>
            <option value="Speeding">Speeding</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            @click.prevent="closeModal"
            type="button"
            class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
