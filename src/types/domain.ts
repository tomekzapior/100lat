export type AvatarTone = 'berry' | 'sun' | 'mint' | 'sky' | 'plum'

export interface Person {
  id: string
  name: string
  nickname: string
  birthdayMd: string
  about: string
  avatarUrl?: string
  avatarTone: AvatarTone
  isAdmin: boolean
  isActive: boolean
  createdAt: string
}

export interface PersonInput {
  name: string
  nickname: string
  birthdayMd: string
  about: string
  avatarUrl?: string
  avatarTone: AvatarTone
  isAdmin: boolean
}

export type SignatureStyle = 'full-name' | 'nickname' | 'first-name'

export interface Wish {
  id: string
  recipientId: string
  authorId: string
  appreciationText: string
  wishText: string
  signatureStyle: SignatureStyle
  signatureLabel: string
  wishYear: number
  createdAt: string
}

export interface WishInput {
  recipientId: string
  authorId: string
  appreciationText: string
  wishText: string
  signatureStyle: SignatureStyle
}

export interface DemoState {
  version: 1
  generatedOn: string
  people: Person[]
  wishes: Wish[]
}

export type WishConflict = 'duplicate' | 'self' | 'early' | null

export interface DemoDataContextValue {
  people: Person[]
  wishes: Wish[]
  isLoading: boolean
  persistFailed: boolean
  addWish: (input: WishInput) => Wish
  addPerson: (input: PersonInput) => Person
  updatePerson: (id: string, input: PersonInput) => Person
  deactivatePerson: (id: string) => void
  restorePerson: (id: string) => void
  resetDemo: () => void
}
