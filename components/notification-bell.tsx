'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, CheckCircle2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // 1. جلب الإشعارات القديمة
    fetchNotifications()

    // 2. الاشتراك في التحديثات الحية (Realtime)
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // عند وصول إشعار جديد، أضفه في الأعلى وزد العداد
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function fetchNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  async function markAllAsRead() {
    if (unreadCount === 0) return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      
    if (!error) {
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }
  }

  async function markAsRead(id: string) {
    const notif = notifications.find(n => n.id === id)
    if (notif && !notif.is_read) {
       await supabase.from('notifications').update({ is_read: true }).eq('id', id)
       setUnreadCount(prev => Math.max(0, prev - 1))
       setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }
  }

  return (
    <Popover>
      {/* بمجرد فتح القائمة، نعتبر أنه قرأ الإشعارات */}
      <PopoverTrigger asChild onClick={() => { if(unreadCount > 0) markAllAsRead() }}>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-2 ring-transparent transition-all hover:ring-primary/50">
          <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 rounded-xl p-0 shadow-2xl border-white/10 backdrop-blur-md bg-card/95 overflow-hidden flex flex-col max-h-[400px]">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-background/50">
          <h4 className="font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-primary cursor-pointer hover:underline font-medium" onClick={markAllAsRead}>
              Mark all as read
            </span>
          )}
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 flex flex-col gap-1 scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">You are all caught up! 📭</div>
          ) : (
            notifications.map(n => (
              <Link 
                key={n.id} 
                href={n.link} 
                onClick={() => markAsRead(n.id)}
                className={`flex gap-3 text-sm p-3 rounded-lg transition-colors hover:bg-white/5 ${!n.is_read ? 'bg-primary/5 border border-primary/10' : 'border border-transparent'}`}
              >
                <div className="shrink-0 mt-0.5">
                  {n.type === 'new_answer' 
                    ? <MessageSquare className="h-4 w-4 text-blue-500" /> 
                    : <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  }
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-foreground leading-snug ${!n.is_read ? 'font-semibold' : ''}`}>{n.message}</span>
                  <span className="text-[11px] font-medium text-muted-foreground/80">{formatDistanceToNow(new Date(n.created_at))} ago</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}