'use client'

import { useState, useEffect, memo } from 'react'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  role: 'owner' | 'admin' | 'member'
  status?: 'pending' | 'accepted'
  invited_at: string
  joined_at: string | null
  invite_email?: string | null
  profiles: {
    id: string
    email: string
  } | null
}

interface TeamMembersProps {
  workspaceId: string
  subscriptionTier: string
  maxMembers: number
  initialMembers: Member[]
}

export const TeamMembers = memo(function TeamMembers({ workspaceId, subscriptionTier, maxMembers, initialMembers }: TeamMembersProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const router = useRouter()

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/workspace/members')
      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }
      const data = await response.json()
      setMembers(data.members || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load members')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      setError('Email is required')
      return
    }

    setInviting(true)
    setError(null)

    try {
      const response = await fetch('/api/workspace/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member')
      }

      setInviteEmail('')
      await fetchMembers()
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    setRemoving(memberId)
    setError(null)

    try {
      const response = await fetch(`/api/workspace/members?memberId=${memberId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      await fetchMembers()
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    } finally {
      setRemoving(null)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'admin':
        return 'Admin'
      case 'member':
        return 'Member'
      default:
        return role
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Member limit info */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Members</p>
            <p className="text-xs text-muted-foreground mt-1">
              {members.length} of {maxMembers} members
            </p>
          </div>
          {members.length >= maxMembers && (
            <span className="text-xs text-warning">Limit reached</span>
          )}
        </div>
      </div>

      {/* Invite form */}
      {members.length < maxMembers && (
        <form onSubmit={handleInvite} className="bg-card border border-border rounded-lg p-4 sm:p-6" noValidate>
          <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 sm:px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base min-h-[44px] sm:min-h-0"
              disabled={inviting}
            />
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base whitespace-nowrap min-h-[44px] sm:min-h-0"
            >
              {inviting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            If the user has an account, they'll be added immediately. Otherwise, an invitation email will be sent.
          </p>
        </form>
      )}

      {/* Members list */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Current Members</h2>
        </div>
        <div className="divide-y divide-border">
          {members.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No members yet. Invite someone to get started!
            </div>
          ) : (
            members.map((member) => {
              const email = member.profiles?.email || member.invite_email || 'Unknown'
              const isPending = member.status === 'pending'
              const displayEmail = member.invite_email || member.profiles?.email || 'Unknown'

              return (
                <div
                  key={member.id}
                  className="p-6 flex items-center justify-between hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {displayEmail.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{displayEmail}</p>
                          {isPending && (
                            <span className="px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getRoleLabel(member.role)}
                          {member.joined_at && (
                            <> • Joined {new Date(member.joined_at).toLocaleDateString()}</>
                          )}
                          {isPending && (
                            <> • Invited {new Date(member.invited_at).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={removing === member.id}
                      className="px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-smooth disabled:opacity-50"
                    >
                      {removing === member.id ? 'Removing...' : 'Remove'}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
})


