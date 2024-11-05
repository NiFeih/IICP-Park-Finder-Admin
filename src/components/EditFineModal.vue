<script setup>
import { toRaw } from 'vue'
import { ref, reactive } from 'vue'
import { defineEmits } from 'vue'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'

const db = getFirestore()
const props = defineProps({
  fine: Object,
})
const carParkLevels = ['Basement', '1', '2']
const reasons = [
  'Double Parking',
  'Not Parking Within Parking Lot',
  'Parking in Reserved/OKU Lot',
  'Overnight Parking',
  'Speeding',
] // Add your reasons here
const fine = ref({
  plateNumber: props.fine.plateNumber,
  carParkLevel: props.fine.carParkLevel,
  reason: props.fine.reason,
})
const emit = defineEmits(['close', 'fine-added'])

async function updateFine() {
  try {
    // Update the fine details in Firestore
    await updateDoc(doc(db, 'Fines', props.fine.id), toRaw(fine.value))

    // Fetch the studentID from the Users collection based on the userId from CarPlateNumbers
    const carPlateQuery = query(
      collection(db, 'CarPlateNumbers'),
      where('plateNumber', '==', props.fine.plateNumber),
    )
    const carPlateSnapshot = await getDocs(carPlateQuery)
    let studentID = null

    if (!carPlateSnapshot.empty) {
      const userId = carPlateSnapshot.docs[0].data().userId
      const userQuery = query(
        collection(db, 'Users'),
        where('uid', '==', userId),
      )
      const userSnapshot = await getDocs(userQuery)

      if (!userSnapshot.empty) {
        studentID = userSnapshot.docs[0].data().studentID
      } else {
        console.error('Student ID not found for the user.')
        alert('Error: Student ID is missing. Please check the data.')
        return
      }
    } else {
      console.error('Car plate document not found')
      alert('Error: Car plate document not found. Please check the data.')
      return
    }

    // Create a log entry for the edit action
    const now = new Date()
    const logData = {
      action: 'Edit',
      date: now.toLocaleDateString('en-US'), // Format date as MM/DD/YYYY
      time: now.toLocaleTimeString('en-US'), // Format time as HH:MM:SS AM/PM
      plateNumber: props.fine.plateNumber,
      studentID: studentID,
    }

    // Add the log entry to the Logging collection
    await addDoc(collection(db, 'Logging'), logData)

    // Close the modal and refresh the page
    closeModal()
    window.location.reload()
  } catch (error) {
    console.error('Error updating fine and logging action:', error)
    alert('Error updating fine. Please try again.')
  }
}

const closeModal = () => {
  emit('close')
}


</script>

<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
  >
    <div class="p-8 border w-96 shadow-lg rounded-md bg-white">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Fine Details</h3>
      <form @submit.prevent="updateFine" class="space-y-4">
        <div>
          <label for="carPlate" class="block text-sm font-medium text-gray-700"
            >Car Plate Number</label
          >
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
            class="block text-sm font-medium text-gray-700"
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
          <label for="reason" class="block text-sm font-medium text-gray-700"
            >Reason</label
          >
          <select
            v-model="fine.reason"
            id="reason"
            required
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option disabled value="">Select a reason</option>
            <option v-for="reason in reasons" :key="reason" :value="reason">
              {{ reason }}
            </option>
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
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
