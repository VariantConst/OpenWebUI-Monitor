import { Button } from '@/components/ui/button'
import { CircleCheck, X, AlertCircle } from 'lucide-react'

interface NotificationDemoProps {
    type: 'success' | 'error'
    message: string
    onClose?: () => void
}

function NotificationDemo({ type, message, onClose }: NotificationDemoProps) {
    return (
        <div className="z-[100] max-w-[400px] rounded-lg border border-border bg-background px-4 py-3 shadow-lg shadow-black/5">
            <div className="flex gap-2">
                <p className="grow text-sm">
                    {type === 'success' ? (
                        <CircleCheck
                            className="-mt-0.5 me-3 inline-flex text-emerald-500"
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    ) : (
                        <AlertCircle
                            className="-mt-0.5 me-3 inline-flex text-red-500"
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                        />
                    )}
                    {message}
                </p>
                <Button
                    variant="ghost"
                    className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                    aria-label="Close notification"
                    onClick={onClose}
                >
                    <X
                        size={16}
                        strokeWidth={2}
                        className="opacity-60 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                    />
                </Button>
            </div>
        </div>
    )
}

export { NotificationDemo }
