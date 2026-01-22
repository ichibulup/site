import type { User as SupabaseUser } from '@supabase/supabase-js'
import { appGlobal } from "@/lib/constants"
import {
  AuthProvider,
  UserActivityStatus,
  UserRole,
  UserStatus,
  OrganizationShortly,
  RestaurantShortly,
  User
} from '@/lib/interfaces'

export interface FormatUtils {
  formatCurrency(value: number, currency: string): string
  formatDate(date: Date): string
}

export interface FormatUtils {
  formatCurrency(value: number, currency: string): string
  formatDate(date: Date): string
}

export interface FormatCurrencyProps {
  value: number | string
  currency?: string
  locales?: string
}

export interface FormatDateTimeProps {
  date: Date | string
  locales?: string
}

export function formatCurrency({
  value,
  currency = appGlobal.currency,
  locales = appGlobal.locales
}: FormatCurrencyProps) {
  const numeric = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat(locales, {
    style: 'currency',
    currency
  }).format(numeric || 0)

  // return new Intl.NumberFormat(locales, {
  //   style: "currency",
  //   currency,
  // }).format(value)
}

export function formatDateTime({
  date,
  locales = appGlobal.locales
}: FormatDateTimeProps) {
  const object = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locales, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    // second: "numeric",
  }).format(object)

  // return new Intl.DateTimeFormat("vi-VN", {
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // }).format(date)
}

export function getUserName(user: User | null | undefined): string {
  return user
    ? user?.fullName ||
    (user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : null) ||
    'User Account'
    : 'Visitor Account';
}

export function getSupabaseUserName(user: SupabaseUser): string {
  return user
    ? user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.user_metadata?.first_name && user?.user_metadata?.last_name
      ? `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}`
      : null) ||
    'User Account'
    : 'Visitor Account';
}

export function formatSupabaseUser({
  user
}: {
  user: any
}) {
  const formatUser = {

  }

  return formatUser
}

type SupabaseMeta = Record<string, any>

const hasOwn = (obj: SupabaseMeta, key: string) =>
  Object.prototype.hasOwnProperty.call(obj, key)

const getValue = (obj: SupabaseMeta, ...keys: string[]) => {
  for (const key of keys) {
    if (hasOwn(obj, key)) {
      return obj[key]
    }
  }
  return undefined
}

const toDate = (value: unknown): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date
}

const toNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined) return fallback
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

const toOptionalNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : null
}

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  if (typeof value === 'number') return value !== 0
  if (value === null || value === undefined) return fallback
  return Boolean(value)
}

const toEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: unknown,
  fallback: T[keyof T]
): T[keyof T] => {
  if (typeof value === 'string' && Object.values(enumObj).includes(value as T[keyof T])) {
    return value as T[keyof T]
  }
  return fallback
}

const isAuthProvider = (value: unknown): value is AuthProvider =>
  typeof value === 'string' && Object.values(AuthProvider).includes(value as AuthProvider)

const normalizeProviders = (value: unknown): AuthProvider[] => {
  if (Array.isArray(value)) {
    return value.filter(isAuthProvider)
  }
  if (isAuthProvider(value)) {
    return [value]
  }
  return []
}

const toArray = (value: unknown): any[] => (Array.isArray(value) ? value : [])

const getMetaObject = (value: unknown): SupabaseMeta | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as SupabaseMeta
}

const toStringOrEmpty = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  return undefined
}

const toNonEmptyString = (value: unknown): string | null => {
  const str = toOptionalString(value)
  if (!str) return null
  const trimmed = str.trim()
  return trimmed ? trimmed : null
}

const getIdFromObject = (value: unknown): string | null => {
  const obj = getMetaObject(value)
  if (!obj) return null
  return toNonEmptyString(obj.id)
}

export const getMetadataId = (
  appMeta: Record<string, any>,
  snakeKey: string,
  camelKey: string,
  objectKey: string
) => {
  const direct = toNonEmptyString(appMeta[snakeKey] ?? appMeta[camelKey])
  if (direct) return direct
  return getIdFromObject(appMeta[objectKey])
}

export const unwrapApiData = <T>(data: unknown): T | null => {
  if (!data) return null
  const payload = (data as { data?: T }).data
  return (payload ?? data) as T
}

export const normalizeOrganizationShortly = (value: unknown): OrganizationShortly | null => {
  const obj = getMetaObject(value)
  if (!obj) return null

  const id = toNonEmptyString(obj.id)
  const name = toNonEmptyString(obj.name)
  if (!id || !name) return null

  return {
    id,
    name,
    code: toStringOrEmpty(obj.code),
    logoUrl: toOptionalString(obj.logo_url) ?? toOptionalString(obj.logoUrl),
    description: toOptionalString(obj.description),
  }
}

export const normalizeRestaurantShortly = (value: unknown): RestaurantShortly | null => {
  const obj = getMetaObject(value)
  if (!obj) return null

  const id = toNonEmptyString(obj.id)
  const name = toNonEmptyString(obj.name)
  if (!id || !name) return null

  return {
    id,
    name,
    code: toStringOrEmpty(obj.code),
    logoUrl: toOptionalString(obj.logo_url) ?? toOptionalString(obj.logoUrl),
    description: toOptionalString(obj.description),
  }
}

export function normalizeUserFromSupabase(user: SupabaseUser): User {
  const meta = (user.user_metadata ?? {}) as SupabaseMeta
  const appMeta = (user.app_metadata ?? {}) as SupabaseMeta

  const email = (user.email ?? getValue(meta, 'email') ?? '') as string
  const emailNormalized = String(
    getValue(meta, 'email_normalized', 'emailNormalized') ?? email ?? ''
  ).toLowerCase()

  const firstName = (getValue(meta, 'first_name', 'firstName') ?? null) as string | null
  const lastName = (getValue(meta, 'last_name', 'lastName') ?? null) as string | null
  const fullNameValue = getValue(meta, 'full_name', 'fullName', 'name')
  const fullName =
    fullNameValue !== undefined
      ? String(fullNameValue ?? '').trim() || null
      : [firstName, lastName].filter(Boolean).join(' ') || null

  const phoneNumber =
    (getValue(meta, 'phone_number', 'phoneNumber') ?? user.phone ?? null) as string | null
  const phoneCode = (getValue(meta, 'phone_code', 'phoneCode') ?? null) as string | null

  const avatarUrl = (getValue(meta, 'avatar_url', 'avatarUrl', 'picture') ?? null) as
    | string
    | null
  const imageUrl =
    (getValue(meta, 'image_url', 'imageUrl') ?? avatarUrl ?? null) as string | null

  const status = toEnumValue(UserStatus, getValue(meta, 'status'), UserStatus.active)
  const role = toEnumValue(
    UserRole,
    getValue(meta, 'role') ?? getValue(appMeta, 'role'),
    UserRole.customer
  )
  const activityStatus = toEnumValue(
    UserActivityStatus,
    getValue(meta, 'activity_status', 'activityStatus'),
    UserActivityStatus.available
  )

  const providers = normalizeProviders(getValue(appMeta, 'providers') ?? getValue(meta, 'providers'))
  const lastProviderValue =
    getValue(appMeta, 'provider', 'last_provider', 'lastProvider') ??
    getValue(meta, 'provider', 'last_provider', 'lastProvider')
  const lastProvider = isAuthProvider(lastProviderValue) ? lastProviderValue : null

  const createdAt =
    toDate(getValue(meta, 'created_at', 'createdAt')) ??
    toDate(user.created_at) ??
    new Date()
  const updatedAt =
    toDate(getValue(meta, 'updated_at', 'updatedAt')) ??
    toDate(user.updated_at) ??
    createdAt

  const legalAcceptedAt = toDate(getValue(meta, 'legal_accepted_at', 'legalAcceptedAt'))
  const dateOfBirth = toDate(getValue(meta, 'date_of_birth', 'dateOfBirth'))

  const emailVerifiedAt = toDate(
    getValue(meta, 'email_verified_at', 'emailVerifiedAt') ?? user.email_confirmed_at
  )
  const phoneVerifiedAt = toDate(
    getValue(meta, 'phone_verified_at', 'phoneVerifiedAt') ?? user.phone_confirmed_at
  )
  const lastSignInAt = toDate(
    getValue(meta, 'last_sign_in_at', 'lastSignInAt') ?? user.last_sign_in_at
  )
  const lastActivityAt = toDate(getValue(meta, 'last_activity_at', 'lastActivityAt'))
  const lastSeenAt = toDate(getValue(meta, 'last_seen_at', 'lastSeenAt'))

  const totalSpentValue = getValue(meta, 'total_spent', 'totalSpent')

  return {
    id: String(getValue(appMeta, 'sub')),
    username: (getValue(meta, 'username', 'preferred_username') ?? null) as string | null,
    email,
    emailNormalized,
    firstName,
    lastName,
    fullName,
    phoneCode,
    phoneNumber,
    avatarUrl,
    emailVerifiedAt,
    phoneVerifiedAt,

    status,
    role,
    activityStatus,
    isOnline: toBoolean(getValue(meta, 'is_online', 'isOnline'), false),
    lastActivityAt,
    lastSeenAt,

    dateOfBirth,
    gender: (getValue(meta, 'gender') ?? null) as string | null,

    loyaltyPoints: toNumber(getValue(meta, 'loyalty_points', 'loyaltyPoints'), 0),
    totalOrders: toNumber(getValue(meta, 'total_orders', 'totalOrders'), 0),
    totalSpent: String(totalSpentValue ?? '0'),
    lastSignInAt,

    supabaseUserId: user.id,
    providers,
    lastProvider,

    twoFactorEnabled: toBoolean(getValue(meta, 'two_factor_enabled', 'twoFactorEnabled'), false),
    totpEnabled: toBoolean(getValue(meta, 'totp_enabled', 'totpEnabled'), false),
    backupCodeEnabled: toBoolean(getValue(meta, 'backup_code_enabled', 'backupCodeEnabled'), false),
    banned: toBoolean(getValue(meta, 'banned'), false),
    locked: toBoolean(getValue(meta, 'locked'), false),
    lockoutExpiresInSeconds: toOptionalNumber(
      getValue(meta, 'lockout_expires_in_seconds', 'lockoutExpiresInSeconds')
    ),
    deleteSelfEnabled: toBoolean(getValue(meta, 'delete_self_enabled', 'deleteSelfEnabled'), true),
    createOrganizationEnabled: toBoolean(
      getValue(meta, 'create_organization_enabled', 'createOrganizationEnabled'),
      false
    ),
    createOrganizationsLimit: toOptionalNumber(
      getValue(meta, 'create_organizations_limit', 'createOrganizationsLimit')
    ),
    legalAcceptedAt,

    publicMetadata: getValue(meta, 'public_metadata', 'publicMetadata') ?? {},
    privateMetadata: getValue(meta, 'private_metadata', 'privateMetadata') ?? {},
    unsafeMetadata: getValue(meta, 'unsafe_metadata', 'unsafeMetadata') ?? {},
    emailAddresses: toArray(getValue(meta, 'email_addresses', 'emailAddresses')),
    phoneNumbers: toArray(getValue(meta, 'phone_numbers', 'phoneNumbers')),
    web3Wallets: getValue(meta, 'web3_wallets', 'web3Wallets') ?? [],
    externalAccounts: getValue(meta, 'external_accounts', 'externalAccounts') ?? [],
    enterpriseAccounts: getValue(meta, 'enterprise_accounts', 'enterpriseAccounts') ?? [],
    passkeys: getValue(meta, 'passkeys') ?? [],

    hasImage: toBoolean(getValue(meta, 'has_image', 'hasImage'), Boolean(imageUrl)),
    imageUrl,
    passwordEnabled: toBoolean(
      getValue(meta, 'password_enabled', 'passwordEnabled') ??
      getValue(appMeta, 'password_enabled', 'passwordEnabled'),
      false
    ),
    twoFactorSecret: (getValue(meta, 'two_factor_secret', 'twoFactorSecret') ?? null) as
      | string
      | null,
    backupCodes: getValue(meta, 'backup_codes', 'backupCodes') ?? [],

    createdAt,
    updatedAt,
  }
}

