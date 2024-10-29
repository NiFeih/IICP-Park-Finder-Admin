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
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'

const props = defineProps({
  isOpen: Boolean,
  fineId: String,
})

const emit = defineEmits(['close', 'deleted']) // Declare emitted events

const db = getFirestore()

const handleDelete = async () => {
  try {
    // Delete the fine document using the fineId passed as a prop
    await deleteDoc(doc(db, 'Fines', props.fineId))
    console.log('Fine deleted successfully')
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

<style scoped>
/* Add any additional styles here */
</style>
