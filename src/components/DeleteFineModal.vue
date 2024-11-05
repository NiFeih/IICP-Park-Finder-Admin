<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-96">
      <h2 class="text-lg font-semibold">Confirm Deletion</h2>
      <p>Are you sure you want to delete this fine?</p>
      <div class="flex justify-end mt-4">
        <button
          @click="handleDelete"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
        <button @click="closeModal" class="ml-2 px-4 py-2 rounded border">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import {
  getFirestore,
  doc,
  deleteDoc,
  addDoc,
  collection,
} from 'firebase/firestore'

const props = defineProps({
  isOpen: Boolean,
  fineId: String,
  plateNumber: String, // Make sure to pass the plate number as a prop
  studentId: String, // Make sure to pass the student ID as a prop
})

const emit = defineEmits(['close', 'deleted']) // Declare emitted events

const db = getFirestore()

import { query, where, getDocs, updateDoc } from 'firebase/firestore'

const handleDelete = async () => {
  try {
    // Delete the fine document using the fineId passed as a prop
    await deleteDoc(doc(db, 'Fines', props.fineId))
    console.log('Fine deleted successfully')

    // Query to find the car plate document based on plateNumber
    const carPlateQuery = query(
      collection(db, 'CarPlateNumbers'),
      where('plateNumber', '==', props.plateNumber),
    )
    const querySnapshot = await getDocs(carPlateQuery)

    if (!querySnapshot.empty) {
      // Assuming only one document matches the plate number
      const carPlateDoc = querySnapshot.docs[0]
      await updateDoc(doc(db, 'CarPlateNumbers', carPlateDoc.id), {
        lock: false,
      })
      console.log('Car plate unlocked successfully')
    } else {
      console.error('Car plate document not found')
      alert('Error: Car plate document not found')
    }

    // Log the deletion event in the Logging collection
    await addDoc(collection(db, 'Logging'), {
      date: new Date().toLocaleDateString('en-US'),
      time: new Date().toLocaleTimeString('en-US'),
      plateNumber: props.plateNumber,
      studentID: props.studentId,
      action: 'Delete',
    })
    console.log('Deletion logged successfully')

    emit('deleted') // Emit an event to notify the parent component
    closeModal() // Close the modal
  } catch (error) {
    console.error('Error deleting fine:', error)
  }
}

const closeModal = () => {
  emit('close') // Emit close event to the parent component
}
</script>
