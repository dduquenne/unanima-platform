import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the client module
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockOrder = vi.fn()
const mockRange = vi.fn()

vi.mock('../client', () => ({
  createBrowserClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

import { fetchOne, fetchMany, insertOne, updateOne, deleteOne } from '../helpers'

describe('fetchOne', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('returns data on success', async () => {
    mockSingle.mockResolvedValue({
      data: { id: '1', name: 'Test' },
      error: null,
    })

    const result = await fetchOne('profiles', '1')
    expect(result.data).toEqual({ id: '1', name: 'Test' })
    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('profiles')
  })

  it('returns error on failure', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const result = await fetchOne('profiles', 'nonexistent')
    expect(result.data).toBeNull()
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('Not found')
  })
})

describe('fetchMany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ range: mockRange })
    mockRange.mockReturnValue({ eq: mockEq })
  })

  it('uses default options', async () => {
    mockRange.mockResolvedValue({
      data: [{ id: '1' }],
      error: null,
      count: 1,
    })

    const result = await fetchMany('profiles')
    expect(result.data).toEqual([{ id: '1' }])
    expect(result.count).toBe(1)
    expect(result.error).toBeNull()
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(mockRange).toHaveBeenCalledWith(0, 19)
  })

  it('applies custom pagination', async () => {
    mockRange.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })

    await fetchMany('profiles', { page: 3, pageSize: 10 })
    expect(mockRange).toHaveBeenCalledWith(20, 29)
  })

  it('applies filters', async () => {
    mockEq.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })
    mockRange.mockReturnValue({ eq: mockEq })

    await fetchMany('profiles', { filters: { role: 'admin' } })
    expect(mockEq).toHaveBeenCalledWith('role', 'admin')
  })

  it('returns error on failure', async () => {
    mockRange.mockResolvedValue({
      data: null,
      error: { message: 'Query error' },
      count: null,
    })

    const result = await fetchMany('profiles')
    expect(result.data).toEqual([])
    expect(result.error).toBeInstanceOf(Error)
  })
})

describe('insertOne', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
    mockInsert.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
  })

  it('inserts and returns data', async () => {
    mockSingle.mockResolvedValue({
      data: { id: '1', name: 'New' },
      error: null,
    })

    const result = await insertOne('profiles', { name: 'New' })
    expect(result.data).toEqual({ id: '1', name: 'New' })
    expect(result.error).toBeNull()
  })

  it('returns error on insert failure', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Insert error' },
    })

    const result = await insertOne('profiles', { name: 'Fail' })
    expect(result.data).toBeNull()
    expect(result.error?.message).toBe('Insert error')
  })
})

describe('updateOne', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ update: mockUpdate })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ single: mockSingle })
  })

  it('updates and returns data', async () => {
    mockSingle.mockResolvedValue({
      data: { id: '1', name: 'Updated' },
      error: null,
    })

    const result = await updateOne('profiles', '1', { name: 'Updated' })
    expect(result.data).toEqual({ id: '1', name: 'Updated' })
    expect(result.error).toBeNull()
  })

  it('returns error on update failure', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Update error' },
    })

    const result = await updateOne('profiles', '1', { name: 'Fail' })
    expect(result.error?.message).toBe('Update error')
  })
})

describe('deleteOne', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ delete: mockDelete })
    mockDelete.mockReturnValue({ eq: mockEq })
  })

  it('deletes successfully', async () => {
    mockEq.mockResolvedValue({ error: null })

    const result = await deleteOne('profiles', '1')
    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('profiles')
  })

  it('returns error on delete failure', async () => {
    mockEq.mockResolvedValue({ error: { message: 'Delete error' } })

    const result = await deleteOne('profiles', '1')
    expect(result.error?.message).toBe('Delete error')
  })
})
