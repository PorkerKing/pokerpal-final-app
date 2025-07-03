"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUserStore } from '@/stores/userStore';
import { 
  ArrowLeft,
  Mail,
  UserPlus,
  Send,
  Plus,
  X,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function InviteMembersPage() {
  const t = useTranslations('Members');
  const router = useRouter();
  const { selectedClub } = useUserStore();
  const [inviteMethod, setInviteMethod] = useState<'email' | 'link'>('email');
  const [emails, setEmails] = useState<string[]>(['']);
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  // 添加邮箱输入框
  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  // 删除邮箱输入框
  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  // 更新邮箱
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // 生成邀请链接
  const generateInviteLink = async () => {
    if (!selectedClub) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${selectedClub.id}/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          expiresIn: '7d' // 7天有效期
        })
      });

      const data = await response.json();
      if (data.success) {
        setInviteLink(data.data.inviteUrl);
      }
    } catch (error) {
      console.error('生成邀请链接失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发送邮件邀请
  const sendEmailInvites = async () => {
    if (!selectedClub) return;

    const validEmails = emails.filter(email => email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (validEmails.length === 0) {
      alert(t('invite.validation.noValidEmails'));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/clubs/${selectedClub.id}/invites/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: validEmails,
          role: selectedRole,
          message: message.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(t('invite.success.emailSent', { count: validEmails.length }));
        router.push('/members');
      } else {
        alert(t('invite.error.sendFailed'));
      }
    } catch (error) {
      console.error('发送邮件邀请失败:', error);
      alert(t('invite.error.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 复制邀请链接
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // 备用方案
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link
          href="/members"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('invite.title')}</h1>
          <p className="text-gray-600">{t('invite.description')}</p>
        </div>
      </div>

      {/* 邀请方式选择 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('invite.method.title')}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setInviteMethod('email')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              inviteMethod === 'email'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Mail className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-sm font-medium text-gray-900">{t('invite.method.email')}</div>
            <div className="text-xs text-gray-500">{t('invite.method.emailDesc')}</div>
          </button>

          <button
            onClick={() => setInviteMethod('link')}
            className={`p-4 border-2 rounded-lg transition-colors ${
              inviteMethod === 'link'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <UserPlus className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-sm font-medium text-gray-900">{t('invite.method.link')}</div>
            <div className="text-xs text-gray-500">{t('invite.method.linkDesc')}</div>
          </button>
        </div>

        {/* 角色选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('invite.role.label')}
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="MEMBER">{t('roles.member')}</option>
            <option value="VIP">{t('roles.vip')}</option>
            <option value="DEALER">{t('roles.dealer')}</option>
            <option value="CASHIER">{t('roles.cashier')}</option>
            <option value="MANAGER">{t('roles.manager')}</option>
            <option value="ADMIN">{t('roles.admin')}</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">{t('invite.role.description')}</p>
        </div>

        {/* 邮件邀请表单 */}
        {inviteMethod === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('invite.email.label')}
              </label>
              {emails.map((email, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder={t('invite.email.placeholder')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmailField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addEmailField}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="h-4 w-4" />
                {t('invite.email.addMore')}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('invite.message.label')}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('invite.message.placeholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t('invite.message.description')}</p>
            </div>

            <button
              onClick={sendEmailInvites}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              {loading ? t('invite.sending') : t('invite.sendInvites')}
            </button>
          </div>
        )}

        {/* 链接邀请 */}
        {inviteMethod === 'link' && (
          <div className="space-y-4">
            {!inviteLink ? (
              <button
                onClick={generateInviteLink}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? t('invite.generating') : t('invite.generateLink')}
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t('invite.link.generated')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">{t('invite.link.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-sm">{t('invite.link.copy')}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">{t('invite.link.expires')}</p>
                
                <button
                  onClick={() => {
                    setInviteLink('');
                    generateInviteLink();
                  }}
                  disabled={loading}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  {t('invite.link.regenerate')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}