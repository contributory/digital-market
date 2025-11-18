'use client';

import { useState, useEffect } from 'react';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { UserProfile, UpdateProfileInput } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileForm() {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileInput>({
    name: '',
    phone: '',
    marketingEmails: false,
    marketingSms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get<{ profile: UserProfile }>(
        '/account/profile'
      );
      setProfile(response.data!.profile);
      setFormData({
        name: response.data!.profile.name,
        phone: response.data!.profile.phone || '',
        marketingEmails: response.data!.profile.marketingEmails,
        marketingSms: response.data!.profile.marketingSms,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const response = await apiClient.put<{ profile: UserProfile }>(
        '/account/profile',
        formData
      );
      setProfile(response.data!.profile);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!profile) {
    return <div>Failed to load profile</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={profile.email}
          disabled
          className="mt-1 bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1"
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1234567890"
          className="mt-1"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">
          Marketing Preferences
        </h3>
        <div className="flex items-start">
          <input
            id="marketingEmails"
            type="checkbox"
            checked={formData.marketingEmails}
            onChange={(e) =>
              setFormData({
                ...formData,
                marketingEmails: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="marketingEmails"
            className="ml-3 text-sm text-gray-700"
          >
            Receive promotional emails about new products and offers
          </label>
        </div>
        <div className="flex items-start">
          <input
            id="marketingSms"
            type="checkbox"
            checked={formData.marketingSms}
            onChange={(e) =>
              setFormData({ ...formData, marketingSms: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="marketingSms" className="ml-3 text-sm text-gray-700">
            Receive SMS notifications about order updates
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
