import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import BrandLogo2 from '../../components/common/BrandLogo2'
import Input from '../../components/ui/Input'
import { login } from '../../services/api/authApi'
import { isAuthenticated, setAuthUser, setToken } from '../../utils/auth'

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
      if (data?.admin) {
        setAuthUser(data.admin)
      }
      const target = data?.admin?.role === 'ADMIN' ? '/admin/my-account' : from
      navigate(target, { replace: true })
    } catch (error) {
      setApiError(error.response?.data?.message || 'Invalid credentials. Please try again.')
    }
  }

  if (isAuthenticated()) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute -left-28 top-[-160px] h-[420px] w-[420px] rounded-full bg-[#163f7f]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-[-160px] h-[420px] w-[420px] rounded-full bg-[#9eea54]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[12%] top-[28%] h-[320px] w-[320px] rounded-full border-[36px] border-[#163f7f]/10" />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-8 lg:px-12">
        <section className="relative z-10 hidden md:block">
          <BrandLogo2 className="mb-10" imageClassName="h-60 w-60 max-w-none" />
          <h1 className="max-w-sm text-5xl font-semibold leading-tight text-slate-900">Login into your account</h1>
          <p className="mt-4 max-w-md text-lg text-slate-600">Manage profiles, NFC cards, and admin access in one place.</p>
          <div className="mt-8 h-1.5 w-56 rounded-full bg-gradient-to-r from-[#163f7f] to-[#9eea54]" />
        </section>

        <section className="relative z-10">
          <Card className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-8">
            <div className="mb-5 md:hidden">
              <BrandLogo2 className="mb-4" imageClassName="h-16 w-auto max-w-none" />
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
                  className="h-11 min-w-32 rounded-xl !bg-[#163f7f] !bg-none !shadow-none hover:!bg-[#122f61]"
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
