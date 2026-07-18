export const DEMO_MEMBER_CODE = '2026'
export const DEMO_ADMIN_CODE = '4242'

export function isValidMemberCode(value: string) {
  return value === DEMO_MEMBER_CODE
}

export function isValidAdminCode(value: string) {
  return value === DEMO_ADMIN_CODE
}
