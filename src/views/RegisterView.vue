<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, getAuth,sendEmailVerification,sendPasswordResetEmail,signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth();
const router = useRouter()
const errmsg = ref(null)
const user = {
  username:'',
  email:'',
  password:'',
  password_confirmation:''
};
const showPassword = ref(false);
async function register (ev){
  ev.preventDefault();
  try{
    if(!validatePassword()){
      return
    }
   const userCrendential = await createUserWithEmailAndPassword(auth,user.email,user.password)
   if(userCrendential){
    alert('User Registered Successfully')
    router.push('/login')
   }else{
    alert('User Registration Failed')
   }
  }catch(err){
    alert(err)
  }
}
function validatePassword(){
    if(user.password !== user.password_confirmation){
        alert('Password and Password Confirmation must be the same')
        return false
    }else{
        return true
    }
}

</script>
<template>
   <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-md  rounded px-8 py-5 pt-4 pb-5 w-full max-w-md ">
    <form @submit.prevent="register">
      <div class="mb-7 flex justify-center">
        <h1
          class="  font-black"
        >
         Admin Register
        </h1>
      </div>
      <div class="mb-3">
        <label class="block mb-2 sm:text-sm">Name</label>
        <input
          class="rounded shadow appearance-none border px-2 py-2 w-full"
          type="text"
          placeholder="Name"
          v-model="user.username"
        />
      </div>
      
      <div class="mb-3">
        <label class="block mb-2 sm:text-sm">Email</label>
        <input
          class="rounded shadow appearance-none border px-2 py-2 w-full"
          type="email"
          placeholder="Email"
          v-model="user.email"
        />
      </div>
      <div class="mb-3">
        <label class="block mb-2 sm:text-sm">Password</label>
        <input
            v-if="showPassword"
            class="rounded border shadow appearance-none px-2 py-2 w-full"
            type="text"
            placeholder="Password"
            v-model="user.password"
          />
          <input
          v-else="!showPassword"
            class="rounded border shadow appearance-none px-2 py-2 w-full"
            type="password"
            placeholder="Password"
            v-model="user.password"
          />
        <p class="text-red-700 text-sm" v-if="errmsg">{{ errmsg }}</p>
      </div>

      <div class="mb-3">
        <label class="block mb-2 sm:text-sm">Password Confirmation</label>
        <input
            v-if="showPassword"
            class="rounded border shadow appearance-none px-2 py-2 w-full"
            type="text"
            placeholder="Password"
            v-model="user.password_confirmation"
          />
          <input
          v-else="!showPassword"
            class="rounded border shadow appearance-none px-2 py-2 w-full"
            type="password"
            placeholder="Password"
            v-model="user.password_confirmation"
          />
        <p class="text-red-700 text-sm" v-if="errmsg">{{ errmsg }}</p>
      </div>
      <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <input
              name="show password"
              type="checkbox"
              id="showPassword"
              v-model="showPassword"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-200 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">Show Password</label>
          </div>
        </div>

      <div class="w-full flex flex-col items-center">
        <button
          class="block ml-18 px-6 py-2 w-full mb-4 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 sm:text-sm"
          
        >
          Register
        </button>
       
      </div>
    </form>

    <div class="mt-3 text-sm text-center">
      <p>
        Already have account?
        <span
          ><router-link to="/login" class="text-blue-700 hover:text-blue-400">Login</router-link>
        </span>
      </p>
     
    </div>
  </div>
   </div>
  
</template>