<script setup>
import { toRaw } from 'vue'
import { ref,reactive } from 'vue'
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

const db = getFirestore()
const props = defineProps({
  isOpen: Boolean,
  plateNumber: String,
  fineId: String,
  fine: Object,
})

const emit = defineEmits(['close'])
async function markAsPaid(){
console.log(props.fine)
  const fineRef = doc(db, 'Fines', props.fine.id)
  const carPlateQuery = query(
    collection(db, 'CarPlateNumbers'),
    where('plateNumber', '==', props.fine.plateNumber),
  );
  const querySnapshot = await getDocs(carPlateQuery);
  if (!querySnapshot.empty) {
    const carPlateDoc = querySnapshot.docs[0];
    
    await updateDoc(doc(db, 'CarPlateNumbers', carPlateDoc.id), { lock: false });
  }
  updateDoc(fineRef, { paid: true })
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

        <h1> Mark as paid?</h1>
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
