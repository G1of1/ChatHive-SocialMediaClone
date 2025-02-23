import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/login/LoginPage'
import RegisterPage from './pages/auth/register/RegisterPage'
import Sidebar from './components/common/SideBar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'
import FollowersPage from './pages/profile/FollowersPage'
import FollowingPage from './pages/profile/FollowingPage'


function App() {
  const {data: authUser, isLoading, isError, error} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.error) {
          return null;
        }

        if(!res.ok) {
          throw new Error(data.error || "Something went wrong")
        }
        return data;
      }
      catch(error) {
        throw new Error(error);
      }
      
    },
    retry: false,
  })
  if(isLoading) {
    return(
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size={'lg'} />
      </div>
    )
  }
  return (
   
    <div className="flex max-w-6xl mx-auto">
      {authUser && <Sidebar />}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to = '/login' />}/>
        <Route path="/login" element={!authUser ? <LoginPage />: <Navigate to ='/'/>}/>
        <Route path="/register" element={!authUser ? <RegisterPage /> : <Navigate to='/'/>}/>
        <Route path="/notifications" element={authUser ? <NotificationPage /> : <Navigate to='/login' />}/>
        <Route path="/profile/:username" element={authUser ? <ProfilePage /> : <Navigate to='/login' />}/>
        <Route path="/profile/:username/followers" element={authUser ? <FollowersPage /> : <Navigate to='/login' />} />
        <Route path="/profile/:username/following" element = {authUser ? <FollowingPage /> : <Navigate to='/login' />} />
      </Routes>
      {authUser && <RightPanel /> }
      <Toaster />
    </div>
  )
}

export default App
