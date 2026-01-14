import React from 'react'
import LoginForm from "@/component/LoginForm";

const LoginPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">登录</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage