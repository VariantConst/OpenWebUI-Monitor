'use client'

import { useState, useEffect } from 'react'
import { Table, Input, message, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Search, X, Unlock, Lock } from 'lucide-react'
import { EditableCell } from '@/components/editable-cell'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { toast, Toaster } from 'sonner'

interface User {
    id: string
    email: string
    name: string
    role: string
    balance: number
    deleted: boolean
}

interface TFunction {
    (key: string): string
    (key: string, options: { name: string }): string
}

const TABLE_STYLES = `
  [&_.ant-table]:!border-b-0 
  [&_.ant-table-container]:!rounded-xl 
  [&_.ant-table-container]:!border-hidden
  [&_.ant-table-cell]:!border-border/40
  [&_.ant-table-thead_.ant-table-cell]:!bg-muted/30
  [&_.ant-table-thead_.ant-table-cell]:!text-muted-foreground
  [&_.ant-table-thead_.ant-table-cell]:!font-medium
  [&_.ant-table-thead_.ant-table-cell]:!text-sm
  [&_.ant-table-thead]:!border-b
  [&_.ant-table-thead]:border-border/40
  [&_.ant-table-row]:!transition-colors
  [&_.ant-table-row:hover>*]:!bg-muted/60
  [&_.ant-table-tbody_.ant-table-row]:!cursor-pointer
  [&_.ant-table-tbody_.ant-table-cell]:!py-4
  [&_.ant-table-row:last-child>td]:!border-b-0
  [&_.ant-table-cell:first-child]:!pl-6
  [&_.ant-table-cell:last-child]:!pr-6
  [&_.ant-pagination]:!px-6
  [&_.ant-pagination]:!py-4
  [&_.ant-pagination]:!border-t
  [&_.ant-pagination]:border-border/40
  [&_.ant-pagination-item]:!rounded-lg
  [&_.ant-pagination-item]:!border-border/40
  [&_.ant-pagination-item-active]:!bg-primary/10
  [&_.ant-pagination-item-active]:!border-primary/30
  [&_.ant-pagination-item-active>a]:!text-primary
  [&_.ant-pagination-prev_.ant-pagination-item-link]:!rounded-lg
  [&_.ant-pagination-next_.ant-pagination-item-link]:!rounded-lg
  [&_.ant-pagination-prev_.ant-pagination-item-link]:!border-border/40
  [&_.ant-pagination-next_.ant-pagination-item-link]:!border-border/40
`

const formatBalance = (balance: number | string) => {
    const num = typeof balance === 'number' ? balance : Number(balance)
    return isFinite(num) ? num.toFixed(4) : '0.0000'
}

const UserDetailsModal = ({
    user,
    onClose,
    t,
}: {
    user: User | null
    onClose: () => void
    t: TFunction
}) => {
    if (!user) return null

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="w-full max-w-lg mx-auto px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                    <div className="relative px-6 pt-6">
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/80 transition-colors"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </motion.button>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-medium text-2xl">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">
                                    {user.name}
                                </h3>
                                <span className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        {t('users.email')}
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-sm break-all">
                                        {user.email}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        {t('users.id')}
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-sm font-mono break-all">
                                        {user.id}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        {t('users.balance')}
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                        {formatBalance(user.balance)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </motion.div>,
        document.getElementById('modal-root') || document.body
    )
}

const BlockConfirmModal = ({
    user,
    onClose,
    onConfirm,
    t,
}: {
    user: User | null
    onClose: () => void
    onConfirm: () => void
    t: TFunction
}) => {
    if (!user) return null

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="w-full max-w-md mx-auto px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className={`
                h-12 w-12 rounded-full flex items-center justify-center
                ${
                    user.deleted
                        ? 'bg-primary/10 text-primary'
                        : 'bg-destructive/10 text-destructive'
                }
              `}
                            >
                                {user.deleted ? (
                                    <Unlock className="w-6 h-6" />
                                ) : (
                                    <Lock className="w-6 h-6" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-1">
                                    {user.deleted
                                        ? t(
                                              'users.blacklist.unblockConfirm.title'
                                          )
                                        : t(
                                              'users.blacklist.blockConfirm.title'
                                          )}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {user.deleted
                                        ? t(
                                              'users.blacklist.unblockConfirm.description',
                                              {
                                                  name: user.name,
                                              }
                                          )
                                        : t(
                                              'users.blacklist.blockConfirm.description',
                                              {
                                                  name: user.name,
                                              }
                                          )}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded-xl bg-muted/60 hover:bg-muted/80 
                  text-muted-foreground font-medium transition-colors"
                            >
                                {t('common.cancel')}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onConfirm}
                                className={`
                  flex-1 px-4 py-2 rounded-xl font-medium text-white
                  transition-colors
                  ${
                      user.deleted
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-destructive hover:bg-destructive/90'
                  }
                `}
                            >
                                {user.deleted
                                    ? t('users.blacklist.unblock')
                                    : t('users.blacklist.block')}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>,
        document.getElementById('modal-root') || document.body
    )
}

const LoadingState = ({ t }: { t: TFunction }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium text-foreground/70">
            {t('users.loading')}
        </h3>
    </div>
)

export default function UsersPage() {
    const { t } = useTranslation('common')
    const [users, setUsers] = useState<User[]>([])
    const [blacklistUsers, setBlacklistUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [editingKey, setEditingKey] = useState<string>('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [sortInfo, setSortInfo] = useState<{
        field: string | null
        order: 'ascend' | 'descend' | null
    }>({
        field: null,
        order: null,
    })
    const [searchText, setSearchText] = useState('')
    const [showBlacklist, setShowBlacklist] = useState(false)
    const [blacklistCurrentPage, setBlacklistCurrentPage] = useState(1)
    const [blacklistTotal, setBlacklistTotal] = useState(0)

    const fetchUsers = async (page: number, isBlacklist: boolean = false) => {
        setLoading(true)
        try {
            let url = `/api/v1/users?page=${page}&deleted=${isBlacklist}`
            if (sortInfo.field && sortInfo.order) {
                url += `&sortField=${sortInfo.field}&sortOrder=${sortInfo.order}`
            }
            if (searchText) {
                url += `&search=${encodeURIComponent(searchText)}`
            }

            const token = localStorage.getItem('access_token')
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            if (isBlacklist) {
                setBlacklistUsers(data.users)
                setBlacklistTotal(data.total)
            } else {
                setUsers(data.users)
                setTotal(data.total)
            }
        } catch (err) {
            console.error(err)
            message.error(t('users.message.fetchError'))
        } finally {
            setLoading(false)
        }
    }

    const fetchBlacklistTotal = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(
                `/api/v1/users?page=1&deleted=true&pageSize=1`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setBlacklistTotal(data.total)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchUsers(currentPage, false)
        fetchBlacklistTotal()
    }, [currentPage, sortInfo, searchText])

    useEffect(() => {
        if (showBlacklist) {
            fetchUsers(blacklistCurrentPage, true)
        }
    }, [blacklistCurrentPage, showBlacklist, sortInfo, searchText])

    const handleUpdateBalance = async (userId: string, newBalance: number) => {
        try {
            console.log(`Updating balance for user ${userId} to ${newBalance}`)

            const token = localStorage.getItem('access_token')
            if (!token) {
                throw new Error(t('auth.unauthorized'))
            }

            const res = await fetch(`/api/v1/users/${userId}/balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ balance: newBalance }),
            })

            const data = await res.json()
            console.log('Update balance response:', data)

            if (!res.ok) {
                throw new Error(
                    data.error || t('users.message.updateBalance.error')
                )
            }

            setUsers(
                users.map((user) =>
                    user.id === userId ? { ...user, balance: newBalance } : user
                )
            )

            toast.success(t('users.message.updateBalance.success'))
            setEditingKey('')

            fetchUsers(currentPage, false)
        } catch (err) {
            console.error('Failed to update balance:', err)
            toast.error(
                err instanceof Error
                    ? err.message
                    : t('users.message.updateBalance.error')
            )
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const token = localStorage.getItem('access_token')
            const res = await fetch(`/api/v1/users/${userToDelete.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    deleted: !userToDelete.deleted,
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message)
            }

            if (!userToDelete.deleted) {
                const newTotal = total - 1
                const maxPage = Math.ceil(newTotal / 20)
                if (currentPage > maxPage && maxPage > 0) {
                    setCurrentPage(maxPage)
                } else {
                    fetchUsers(currentPage, false)
                }
                setBlacklistTotal((prev) => prev + 1)
            } else {
                const newBlacklistTotal = blacklistTotal - 1
                const maxBlacklistPage = Math.ceil(newBlacklistTotal / 20)
                if (
                    blacklistCurrentPage > maxBlacklistPage &&
                    maxBlacklistPage > 0
                ) {
                    setBlacklistCurrentPage(maxBlacklistPage)
                } else {
                    fetchUsers(blacklistCurrentPage, true)
                }
                setBlacklistTotal((prev) => prev - 1)
            }

            if (userToDelete.deleted) {
                fetchUsers(currentPage, false)
            } else if (showBlacklist) {
                fetchUsers(blacklistCurrentPage, true)
            }

            toast.success(
                userToDelete.deleted
                    ? t('users.message.unblockSuccess')
                    : t('users.message.blockSuccess')
            )
        } catch (err) {
            toast.error(
                userToDelete.deleted
                    ? t('users.message.unblockError')
                    : t('users.message.blockError')
            )
        } finally {
            setUserToDelete(null)
        }
    }

    const UserCard = ({ record }: { record: User }) => {
        return (
            <div
                className="p-4 sm:p-6 bg-card rounded-xl border border-border/40 
        shadow-sm hover:shadow-md transition-all duration-200"
            >
                <div className="flex items-start gap-4">
                    <div
                        className="flex-1 min-w-0 flex items-start gap-4 cursor-pointer"
                        onClick={() => setSelectedUser(record)}
                    >
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-medium text-lg shrink-0">
                            {record.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-semibold tracking-tight max-w-[160px] truncate">
                                    {record.name}
                                </h3>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                                    {record.role}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-[240px] truncate">
                                {record.email}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setUserToDelete(record)
                        }}
                        className={`
              shrink-0
              p-2
              rounded-md
              transition-colors
              ${
                  record.deleted
                      ? 'text-muted-foreground/60 hover:text-muted-foreground'
                      : 'text-muted-foreground/60 hover:text-muted-foreground'
              }
            `}
                    >
                        {record.deleted ? (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="mt-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            {t('users.balance')}
                        </span>
                        <div className="flex-1 max-w-[200px]">
                            <EditableCell
                                value={record.balance}
                                isEditing={record.id === editingKey}
                                onEdit={() => setEditingKey(record.id)}
                                onSubmit={(value) =>
                                    handleUpdateBalance(record.id, value)
                                }
                                onCancel={() => setEditingKey('')}
                                t={t}
                                validateValue={(value) => ({
                                    isValid: isFinite(value),
                                    errorMessage: t('error.invalidNumber'),
                                    maxValue: 999999.9999,
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const getColumns = (isBlacklist: boolean = false): ColumnsType<User> => {
        const baseColumns: ColumnsType<User> = [
            {
                title: t('users.userInfo'),
                key: 'userInfo',
                width: '65%',
                render: (_, record) => (
                    <div
                        className="flex items-center gap-4 cursor-pointer py-1"
                        onClick={() => setSelectedUser(record)}
                    >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {record.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium max-w-[200px] truncate">
                                    {record.name}
                                </span>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                                    {record.role}
                                </span>
                            </div>
                            <div className="text-sm text-muted-foreground max-w-[280px] truncate">
                                {record.email}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: t('users.balance'),
                dataIndex: 'balance',
                key: 'balance',
                width: '35%',
                align: 'left',
                sorter: {
                    compare: (a, b) => a.balance - b.balance,
                    multiple: 1,
                },
                render: (balance: number, record) => {
                    const isEditing = record.id === editingKey

                    return (
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <EditableCell
                                    value={balance}
                                    isEditing={isEditing}
                                    onEdit={() => setEditingKey(record.id)}
                                    onSubmit={(value) =>
                                        handleUpdateBalance(record.id, value)
                                    }
                                    onCancel={() => setEditingKey('')}
                                    t={t}
                                    validateValue={(value) => ({
                                        isValid: isFinite(value),
                                        errorMessage: t('error.invalidNumber'),
                                        maxValue: 999999.9999,
                                    })}
                                />
                            </div>
                        </div>
                    )
                },
            },
            {
                title: t('users.actions'),
                key: 'actions',
                width: '48px',
                align: 'center',
                render: (_, record) => (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setUserToDelete(record)
                        }}
                        className={`
              p-2
              rounded-md
              transition-colors
              ${
                  record.deleted
                      ? 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40'
                      : 'text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/40'
              }
            `}
                    >
                        {record.deleted ? (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                            </svg>
                        )}
                    </button>
                ),
            },
        ]

        return baseColumns
    }

    const SearchBar = () => {
        const [isFocused, setIsFocused] = useState(false)
        const [searchValue, setSearchValue] = useState(searchText)

        const handleSearch = () => {
            setSearchText(searchValue)
        }

        const handleClear = () => {
            setSearchValue('')
            setTimeout(() => {
                setSearchText('')
            }, 0)
        }

        return (
            <motion.div
                initial={false}
                animate={{
                    boxShadow: isFocused
                        ? '0 4px 24px rgba(0, 0, 0, 0.08)'
                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
                className="relative w-full rounded-2xl bg-card border border-border/40 overflow-hidden"
            >
                <motion.div
                    initial={false}
                    animate={{
                        height: '100%',
                        width: '3px',
                        left: 0,
                        opacity: isFocused ? 1 : 0,
                    }}
                    className="absolute top-0 bg-primary"
                    style={{ originY: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />

                <div className="relative flex items-center">
                    <div className="absolute left-4 text-muted-foreground/60 pointer-events-none z-10">
                        <Search className="h-4 w-4" />
                    </div>

                    <Input
                        type="search"
                        autoComplete="off"
                        spellCheck="false"
                        placeholder={t('users.searchPlaceholder')}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch()
                            }
                        }}
                        className="
              w-full
              pl-12
              pr-24
              py-3
              h-12
              leading-normal
              bg-transparent
              border-0
              ring-0
              focus:ring-0
              placeholder:text-muted-foreground/50
              text-base
              [&::-webkit-search-cancel-button]:hidden
            "
                        allowClear={{
                            clearIcon: searchValue ? (
                                <motion.button
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="p-1.5 hover:bg-muted/80 rounded-full transition-colors z-10 
                    bg-muted/60 text-muted-foreground/70"
                                    onClick={handleClear}
                                >
                                    <X className="h-3 w-3" />
                                </motion.button>
                            ) : null,
                        }}
                    />

                    <div className="absolute right-4 flex items-center pointer-events-auto z-20">
                        <button
                            onClick={handleSearch}
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/20 
                transition-colors px-3 py-1.5 rounded-full font-medium"
                        >
                            {t('users.search')}
                        </button>
                    </div>
                </div>
            </motion.div>
        )
    }

    const EmptyState = ({ searchText }: { searchText: string }) => (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
                {t('users.noResults.title')}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-[300px]">
                {searchText
                    ? t('users.noResults.withFilter', { filter: searchText })
                    : t('users.noResults.default')}
            </p>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">
            <Toaster
                richColors
                position="top-center"
                theme="light"
                expand
                duration={1500}
            />
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('users.title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('users.description')}
                </p>
            </div>

            <SearchBar />

            <div className="hidden sm:block">
                <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
                    {loading ? (
                        <LoadingState t={t} />
                    ) : users.filter((user) => !user.deleted).length > 0 ? (
                        <Table
                            columns={getColumns(false)}
                            dataSource={users
                                .filter((user) => !user.deleted)
                                .map((user) => ({
                                    key: user.id,
                                    ...user,
                                    balance: Number(user.balance),
                                }))}
                            rowKey="id"
                            loading={false}
                            className={TABLE_STYLES}
                            pagination={{
                                total,
                                pageSize: 20,
                                current: currentPage,
                                onChange: (page) => {
                                    setCurrentPage(page)
                                    setEditingKey('')
                                },
                                showTotal: (total) => (
                                    <span className="text-sm text-muted-foreground">
                                        {t('users.total')} {total}{' '}
                                        {t('users.totalRecords')}
                                    </span>
                                ),
                            }}
                            scroll={{ x: 500 }}
                            onChange={(pagination, filters, sorter) => {
                                if (Array.isArray(sorter)) return
                                setSortInfo({
                                    field: sorter.columnKey as string,
                                    order: sorter.order || null,
                                })
                            }}
                        />
                    ) : (
                        <EmptyState searchText={searchText} />
                    )}
                </div>
            </div>

            <div className="sm:hidden">
                <div className="grid gap-4">
                    {loading ? (
                        <LoadingState t={t} />
                    ) : users.filter((user) => !user.deleted).length > 0 ? (
                        users
                            .filter((user) => !user.deleted)
                            .map((user) => (
                                <UserCard key={user.id} record={user} />
                            ))
                    ) : (
                        <EmptyState searchText={searchText} />
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => setShowBlacklist(!showBlacklist)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <svg
                        className={`w-4 h-4 transition-transform ${
                            showBlacklist ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                    {t('users.blacklist.title')} ({blacklistTotal})
                </button>

                {showBlacklist && (
                    <div className="space-y-4">
                        <div className="hidden sm:block">
                            <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
                                {loading ? (
                                    <LoadingState t={t} />
                                ) : blacklistUsers.length > 0 ? (
                                    <Table
                                        columns={getColumns(true)}
                                        dataSource={blacklistUsers.map(
                                            (user) => ({
                                                key: user.id,
                                                ...user,
                                                balance: Number(user.balance),
                                            })
                                        )}
                                        rowKey="id"
                                        loading={false}
                                        className={TABLE_STYLES}
                                        pagination={{
                                            total: blacklistTotal,
                                            pageSize: 20,
                                            current: blacklistCurrentPage,
                                            onChange: (page) => {
                                                setBlacklistCurrentPage(page)
                                                setEditingKey('')
                                            },
                                            showTotal: (total) => (
                                                <span className="text-sm text-muted-foreground">
                                                    {t('users.total')} {total}{' '}
                                                    {t('users.totalRecords')}
                                                </span>
                                            ),
                                        }}
                                    />
                                ) : (
                                    <EmptyState searchText={searchText} />
                                )}
                            </div>
                        </div>

                        <div className="sm:hidden">
                            <div className="grid gap-4">
                                {loading ? (
                                    <LoadingState t={t} />
                                ) : blacklistUsers.length > 0 ? (
                                    blacklistUsers.map((user) => (
                                        <UserCard key={user.id} record={user} />
                                    ))
                                ) : (
                                    <EmptyState searchText={searchText} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedUser && (
                    <UserDetailsModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                        t={t}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {userToDelete && (
                    <BlockConfirmModal
                        user={userToDelete}
                        onClose={() => setUserToDelete(null)}
                        onConfirm={handleDeleteUser}
                        t={t}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
