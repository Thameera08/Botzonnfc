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
    <div className="relative min-h-screen overflow-hidden bg-[#041a63]">
      <div className="pointer-events-none absolute -left-24 top-[-120px] h-[420px] w-[420px] rounded-full bg-[#3f46d8]/35 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-[-140px] h-[380px] w-[380px] rounded-full bg-[#2b39c9]/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-[15%] h-[460px] w-[460px] rounded-full border-[58px] border-[#3f46d8]/25" />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-8 lg:px-12">
        <section className="relative z-10 hidden md:block">
          <BrandLogo className="mb-10" />
          <h1 className="max-w-sm text-5xl font-semibold leading-tight text-white">Login into your account</h1>
          <p className="mt-4 text-lg text-blue-100/80">Manage profiles, NFC cards, and admin access in one place.</p>
        </section>

        <section className="relative z-10">
          <Card className="mx-auto w-full max-w-lg rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-5 md:hidden">
              <BrandLogo className="mb-4" />
              <h1 className="text-2xl font-bold text-slate-900">ConnetMe Admin Login</h1>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Input label="Email" type="email" placeholder="name@example.com" error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" placeholder="Your password" error={errors.password?.message} {...register('password')} />

              {apiError ? <p className="text-sm text-rose-600">{apiError}</p> : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Don&apos;t have an account? <span className="font-semibold text-slate-800">Contact super admin</span>
                </p>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="h-11 min-w-32 rounded-xl !bg-blue-600 !bg-none !shadow-none hover:!bg-blue-700"
                >
                  Login
                </Button>
              </div>
            </form>
          </Card>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
