import {
  ArrowUpRight,
  Copy,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Twitter,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../../components/ui/Card'
import BrandLogo from '../../components/common/BrandLogo'
import { getPublicProfile } from '../../services/api/profileApi'

function PublicProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copyMessage, setCopyMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        const response = await getPublicProfile(username)
        setProfile(response?.data || response)
      } catch {
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  const disabled = profile?.status === 'DISABLED'
  const theme = profile?.public_theme || 'DARK_MINIMAL'
  const isDarkTheme = theme === 'DARK_MINIMAL'
  const isLightGlassTheme = theme === 'LIGHT_GLASS'
  const profileLink = typeof window !== 'undefined' ? window.location.href : ''

  const socialLinks = useMemo(
    () => [
      { icon: Linkedin, href: profile?.linkedin_url, label: 'LinkedIn' },
      { icon: Facebook, href: profile?.facebook_url, label: 'Facebook' },
      { icon: Instagram, href: profile?.instagram_url, label: 'Instagram' },
      { icon: Twitter, href: profile?.twitter_url, label: 'Twitter' },
      { icon: MessageCircle, href: profile?.whatsapp_url, label: 'WhatsApp' },
    ],
    [profile],
  )

  const detailLinks = useMemo(
    () => [
      {
        label: 'Facebook',
        subtitle: 'Open Facebook profile',
        icon: Facebook,
        href: profile?.facebook_url,
      },
      {
        label: 'Instagram',
        subtitle: 'Open Instagram profile',
        icon: Instagram,
        href: profile?.instagram_url,
      },
      {
        label: 'Website',
        subtitle: 'Visit company details',
        icon: Globe,
        href: profile?.company_name ? `https://www.google.com/search?q=${encodeURIComponent(profile.company_name)}` : '',
      },
    ],
    [profile],
  )

  const openSafe = (url, sameTab = false) => {
    if (disabled || !url) return
    if (sameTab) {
      window.open(url, '_self')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    if (!profileLink) return
    await navigator.clipboard.writeText(profileLink)
    setCopyMessage('Link copied')
    setTimeout(() => setCopyMessage(''), 1500)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: profile?.full_name || 'Business profile',
        text: profile?.designation || '',
        url: profileLink,
      })
    } else {
      await handleCopy()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_40%),#090d17] text-slate-200">
        <div className="w-full">
          <div className="min-h-screen overflow-hidden border border-white/10 bg-[#0d1424] shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:mx-auto md:min-h-[100dvh] md:max-w-md md:rounded-[28px]">
            <div className="relative h-72 animate-pulse bg-gradient-to-br from-slate-700/40 via-slate-600/20 to-slate-800/40">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1424] to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 space-y-2">
                <div className="h-8 w-52 rounded bg-white/20" />
                <div className="h-4 w-36 rounded bg-white/15" />
                <div className="h-3 w-28 rounded bg-white/10" />
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`social-${i}`} className="h-10 animate-pulse rounded-xl bg-slate-700/30" />
                ))}
              </div>
              <div className="rounded-2xl border border-slate-700/60 bg-[#121b2f] p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-600/50" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-600/40" />
                <div className="mt-2 h-3 w-10/12 animate-pulse rounded bg-slate-600/30" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`action-${i}`} className="h-10 animate-pulse rounded-xl bg-slate-700/30" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 py-1 text-xs text-slate-400">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
                Loading profile...
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#090d17] text-slate-200">
        <div className="w-full">
          <Card className="min-h-screen rounded-none border-slate-700/50 bg-[#10182a] p-6 text-center text-slate-300 md:mx-auto md:min-h-[100dvh] md:max-w-md md:rounded-[28px]">
            Profile not found.
          </Card>
        </div>
      </div>
    )
  }

  const pageThemeClass = isDarkTheme
    ? 'min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.25),transparent_40%),#090d17] text-slate-100'
    : isLightGlassTheme
      ? 'min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_40%),#eef5ff] text-slate-900'
      : 'min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.3),transparent_40%),#eaf2ff] text-slate-900'

  const shellClass = isDarkTheme
    ? 'min-h-screen overflow-hidden border border-white/10 bg-[#0d1424] shadow-[0_24px_70px_rgba(0,0,0,0.45)] md:mx-auto md:min-h-[100dvh] md:max-w-md md:rounded-[28px]'
    : 'min-h-screen overflow-hidden border border-slate-200 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur md:mx-auto md:min-h-[100dvh] md:max-w-md md:rounded-[28px]'

  const heroOverlayClass = isDarkTheme
    ? 'absolute inset-0 bg-gradient-to-t from-[#0d1424] via-[#0d1424]/55 to-transparent'
    : 'absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent'

  const contentClass = isDarkTheme ? 'space-y-3 bg-[#0d1424] p-4' : 'space-y-3 bg-transparent p-4'
  const aboutClass = isDarkTheme
    ? 'rounded-2xl border border-slate-700/60 bg-[#121b2f] p-4'
    : 'rounded-2xl border border-slate-200 bg-white/90 p-4'
  const tileClass = isDarkTheme
    ? 'border-slate-700 bg-slate-800/40 text-slate-100 hover:bg-slate-700/60'
    : 'border-slate-200 bg-white/90 text-slate-800 hover:bg-slate-100'
  const tileDisabledClass = isDarkTheme
    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
    : 'cursor-not-allowed border-slate-200 bg-white/60 text-slate-400'
  const actionClass = isDarkTheme
    ? 'border-slate-600 bg-slate-800/50 text-slate-100 hover:bg-slate-700/70'
    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
  const actionDisabledClass = isDarkTheme
    ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
    : 'cursor-not-allowed border-slate-200 bg-white/60 text-slate-400'

  return (
    <div className={pageThemeClass}>
      <div className="w-full">
        <div className={shellClass}>
          <div className="relative h-72 overflow-hidden">
            <img
              src={profile.profile_image_url || 'https://placehold.co/600x800'}
              alt={profile.full_name}
              className="h-full w-full object-cover"
            />
            <div className={heroOverlayClass} />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h1 className="text-4xl font-bold uppercase tracking-tight text-white">{profile.full_name}</h1>
              <p className="mt-1 text-sm text-slate-200">{profile.designation || 'Professional'}</p>
              <p className="text-xs text-slate-400">{profile.company_name || 'Company'}</p>
            </div>
          </div>

          <div className={contentClass}>
            {disabled ? (
              <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
                This business profile is currently unavailable.
              </div>
            ) : null}

            <div className="grid grid-cols-5 gap-2">
              {socialLinks.map((item) => {
                const Icon = item.icon
                const blocked = disabled || !item.href

                return (
                  <button
                    key={item.label}
                    type="button"
                    title={item.label}
                    disabled={blocked}
                    onClick={() => openSafe(item.href)}
                    className={`flex h-10 items-center justify-center rounded-xl border text-sm transition ${
                      blocked
                        ? 'cursor-not-allowed border-slate-700 bg-slate-800/40 text-slate-500'
                        : 'border-slate-600/70 bg-slate-800/50 text-slate-100 hover:bg-slate-700/70'
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>

            <div className={aboutClass}>
              <p className={`text-xs font-semibold uppercase tracking-widest ${isDarkTheme ? 'text-slate-400' : 'text-slate-500'}`}>About</p>
              <p className={`mt-2 text-sm leading-relaxed ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>
                {profile.bio || 'Welcome to my digital business profile.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`tel:${profile.phone}`, true)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  disabled ? actionDisabledClass : actionClass
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Phone size={14} /> Call
                </span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`mailto:${profile.email}`, true)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  disabled ? actionDisabledClass : actionClass
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Mail size={14} /> Email
                </span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${actionClass}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Share2 size={14} /> Share
                </span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${actionClass}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Copy size={14} /> Copy
                </span>
              </button>
            </div>

            {copyMessage ? <p className="text-center text-xs text-emerald-300">{copyMessage}</p> : null}

            <div className="space-y-2">
              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`mailto:${profile.email}`, true)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  disabled
                    ? tileDisabledClass
                    : tileClass
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <Mail size={15} /> {profile.email}
                </span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => openSafe(`tel:${profile.phone}`, true)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  disabled
                    ? tileDisabledClass
                    : tileClass
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <Phone size={15} /> {profile.phone}
                </span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </button>

              <button
                type="button"
                disabled={disabled || !profile.location}
                onClick={() => openSafe(`https://maps.google.com/?q=${encodeURIComponent(profile.location || '')}`)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  disabled || !profile.location
                    ? tileDisabledClass
                    : tileClass
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm">
                  <MapPin size={15} /> {profile.location || 'Location unavailable'}
                </span>
                <ArrowUpRight size={15} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-2">
              {detailLinks.map((item) => {
                const Icon = item.icon
                const blocked = disabled || !item.href

                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={blocked}
                    onClick={() => openSafe(item.href)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                      blocked
                        ? tileDisabledClass
                        : tileClass
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                        <span className={`grid h-8 w-8 place-items-center rounded-lg ${isDarkTheme ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                          <Icon size={15} />
                        </span>
                      <span>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </span>
                    </span>
                    <ArrowUpRight size={15} className="text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 py-3">
          <BrandLogo compact className="opacity-85" />
          <p className="text-center text-xs text-slate-500">Powered by ConnectMe</p>
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePage
