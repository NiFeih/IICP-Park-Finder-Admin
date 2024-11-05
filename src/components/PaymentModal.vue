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
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import {
  ref as storageRef,
  getStorage,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
const db = getFirestore()
const storage = getStorage()
const selectedFile = ref(null)
const props = defineProps({
  isOpen: Boolean,
  plateNumber: String,
  fineId: String,
  fine: Object,
})

const emit = defineEmits(['close'])

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}
async function uploadFile() {
  const fileRef = storageRef(storage, 'receipts/' + selectedFile.value.name)
  const storageSnapshot = await uploadBytes(fileRef, selectedFile.value)
  const downloadURL = await getDownloadURL(storageSnapshot.ref)
  return downloadURL
}
import { Timestamp } from 'firebase/firestore'

async function markAsPaid() {
  const fineRef = doc(db, 'Fines', props.fine.id)
  const carPlateQuery = query(
    collection(db, 'CarPlateNumbers'),
    where('plateNumber', '==', props.fine.plateNumber),
  )
  const querySnapshot = await getDocs(carPlateQuery)
  const receiptFile = await uploadFile()

  if (!querySnapshot.empty) {
    const carPlateDoc = querySnapshot.docs[0]
    const userId = carPlateDoc.data().userId

    // Update CarPlateNumbers document to unlock the vehicle
    await updateDoc(doc(db, 'CarPlateNumbers', carPlateDoc.id), { lock: false })

    if (receiptFile) {
      // Mark the fine as paid and add the receipt URL
      await updateDoc(fineRef, { paid: true, receipt: receiptFile })
    } else {
      alert('File not uploaded')
      return
    }

    // Add notification to the Notifications collection
    const notificationMessage = `${props.fine.plateNumber} has been unclamped.\nPlease do not commit the same mistake again. Thank you.`
    const notificationData = {
      message: notificationMessage,
      read: false,
      sent: true,
      timestamp: Timestamp.now(), // Use Firestore's Timestamp for current date and time
      title: 'Your Vehicle has Been Unclamped',
      uid: userId,
    }

    await addDoc(collection(db, 'Notifications'), notificationData)

    // Fetch the studentID from the Users collection based on userId
    const userQuery = query(collection(db, 'Users'), where('uid', '==', userId))
    const userSnapshot = await getDocs(userQuery)
    const studentID = !userSnapshot.empty
      ? userSnapshot.docs[0].data().studentID
      : null

    // Check if studentID is available
    if (!studentID) {
      console.error('Error: Student ID not found for the user.')
      alert('Error: Student ID is missing. Please check the data.')
      return
    }

    // Create a log entry for the payment action
    const now = new Date()
    const logData = {
      action: 'Pay',
      date: now.toLocaleDateString('en-US'), // Format date as MM/DD/YYYY
      time: now.toLocaleTimeString('en-US'), // Format time as HH:MM:SS AM/PM
      plateNumber: props.fine.plateNumber,
      studentID: studentID, // Use the retrieved student ID
    }

    // Add the log entry to the Logging collection
    await addDoc(collection(db, 'Logging'), logData)
  } else {
    alert('Car plate document not found')
    return
  }

  closeModal()
  window.location.reload()
}

const closeModal = () => {
  emit('close')
}
</script>
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
  >
    <div class="p-8 border w-96 shadow-lg rounded-md bg-white">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Payment</h3>
      <form @submit.prevent="markAsPaid">
        <div>
          <label
            for="fileInput"
            class="block text-sm font-medium text-gray-700"
          >
            Receipt
          </label>
          <input
            type="file"
            required
            @change="handleFileChange"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
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
            Yes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
