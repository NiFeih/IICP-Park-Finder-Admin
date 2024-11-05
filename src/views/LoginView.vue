<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

const db = getFirestore()

const router = useRouter()
const errmsg = ref(null)
const showPassword = ref(false)
const auth = getAuth()
const user = {
  email: '',
  password: '',
}

async function login(ev) {
  ev.preventDefault()
  errmsg.value = null // Clear previous error message
  try {
    // Try signing in the user
    const userCredential = await signInWithEmailAndPassword(
      auth,
      user.email,
      user.password,
    )

    // If the sign-in is successful, check the user's role
    if (userCredential) {
      const userEmail = user.email
      const adminQuery = query(
        collection(db, 'Users'),
        where('email', '==', userEmail),
        where('role', '==', 'admin'),
      )
      const querySnapshot = await getDocs(adminQuery)

      // Check if the user is an admin
      if (querySnapshot.docs.length === 0) {
        errmsg.value = 'You are not an admin'
        console.log('Not admin')
        return false
      }

      alert('User Logged In Successfully')
      router.push('/home')
    }
  } catch (error) {
    // Handle specific error codes from Firebase
    if (error.code === 'auth/wrong-password') {
      errmsg.value = 'Incorrect password. Please try again.'
    } else if (error.code === 'auth/user-not-found') {
      errmsg.value =
        'Email does not exist. Please register or check your email.'
    } else if (error.code === 'auth/invalid-credential') {
      errmsg.value =
        'Invalid credentials provided. Please check your email and password.'
    } else {
      errmsg.value = error.message // Show general error message
    }
    console.log(error)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-xl rounded px-8 py-7 pt-4 pb-8 w-full max-w-md">
      <!-- Title Section -->
      <div class="mb-7 flex flex-col justify-center items-center">
        <h1 class="font-black text-3xl">IICP Park Finder</h1>
        <p class="text-gray-500 text-base mt-1">Admin Login</p>
      </div>

      <form @submit="login">
        <div class="mb-8">
          <label class="block mb-2 text-sm font-medium">Email</label>
          <input
            class="rounded shadow appearance-none border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="email"
            placeholder="Email"
            v-model="user.email"
          />
        </div>

        <div class="mb-8">
          <label class="block mb-2 text-sm font-medium">Password</label>
          <input
            :type="showPassword ? 'text' : 'password'"
            class="rounded border shadow appearance-none px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password"
            v-model="user.password"
          />
          <p class="text-red-700 text-sm mt-1" v-if="errmsg">{{ errmsg }}</p>
        </div>

        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <input
              name="show password"
              type="checkbox"
              id="showPassword"
              v-model="showPassword"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="showPassword" class="ml-2 block text-sm text-gray-900"
              >Show Password</label
            >
          </div>
        </div>

        <div class="w-full flex flex-col items-center">
          <button
            type="submit"
            class="w-full px-6 py-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
