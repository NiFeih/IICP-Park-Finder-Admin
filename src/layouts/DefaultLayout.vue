<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { getAuth } from 'firebase/auth'

const auth = getAuth()
const router = useRouter()
function logout() {
  // Show confirmation dialog
  if (confirm('Are you sure you want to log out?')) {
    auth.signOut()
    router.push({ name: 'login' })
  }
}

const isAuthenticated = computed(() => {
  return false
})
</script>

<template>
  <div class="bg-slate-200 min-h-screen">
    <header class="navbar bg-base-100 fixed top-0 w-full z-10">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><RouterLink to="/home">Home</RouterLink></li>
            <li><RouterLink to="/searchCarPlate">Car Plates</RouterLink></li>
            <li><RouterLink to="/logging">Log Details</RouterLink></li>
          </ul>
        </div>
        <RouterLink to="/home" class="btn btn-ghost text-xl"
          >IICP Park Finder</RouterLink
        >
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><RouterLink to="/home">Home</RouterLink></li>
          <li><RouterLink to="/searchCarPlate">Car Plates</RouterLink></li>
          <li><RouterLink to="/logging">Log Details</RouterLink></li>
        </ul>
      </div>
      <div class="navbar-end flex">
        <div class="dropdown dropdown-end">
          <div
            tabindex="0"
            role="button"
            class="btn btn-ghost btn-circle avatar"
          >
            <div class="w-10 rounded-full">
              <img
                alt="User Avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><button @click="logout">Logout</button></li>
          </ul>
        </div>
      </div>
    </header>
    <main class="pt-[64px]">
      <!-- Adjust the padding-top here to avoid overlapping content -->
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Add your styles here */
html,
body {
  height: 100%;
}

.footer {
  margin-top: auto;
}
</style>
