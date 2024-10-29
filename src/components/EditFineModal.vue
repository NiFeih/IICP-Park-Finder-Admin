<template>
  <div
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
  >
    <div class="p-8 border w-96 shadow-lg rounded-md bg-white">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Fine Details</h3>
      <form @submit.prevent="updateFine" class="space-y-4">
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
            Update
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { toRaw } from 'vue'
import { ref } from 'vue'
import { defineEmits } from 'vue'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'

const db = getFirestore()
const props = defineProps({
  fine: Object,
})
const carParkLevels = ['Basement', '1', '2']
const fine = ref({
  plateNumber: props.fine.plateNumber,
  carParkLevel: props.fine.carParkLevel,
  reason: props.fine.reason,
})
const emit = defineEmits(['close', 'fine-added'])

async function updateFine() {
  await updateDoc(doc(db, 'Fines', props.fine.id), toRaw(fine.value))
  closeModal()
  window.location.reload()
}

const closeModal = () => {
  emit('close')
}
</script>

<style lang="scss" scoped></style>
