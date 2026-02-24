import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import BrandLogo from '../../components/common/BrandLogo'
import Input from '../../components/ui/Input'
import { login } from '../../services/api/authApi'
import { isAuthenticated, setToken } from '../../utils/auth'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password is required'),
})

function LoginPage() {
  const [apiError, setApiError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    setApiError('')
    try {
      const data = await login(values)
      const token = data?.token || data?.access_token

      if (!token) {
        setApiError('Login succeeded but no token was returned.')
        return
      }

      setToken(token)
      navigate(from, { replace: true })
    } catch (error) {
      setApiError(error.response?.data?.message || 'Invalid credentials. Please try again.')
    }
  }

  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <BrandLogo className="mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">ConnetMe Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage business profiles and user access.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" placeholder="admin@domain.com" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

          {apiError ? <p className="text-sm text-rose-600">{apiError}</p> : null}

          <Button type="submit" fullWidth loading={isSubmitting}>
            Login
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
