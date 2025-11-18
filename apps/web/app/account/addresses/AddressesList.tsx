'use client';

import { useState, useEffect } from 'react';
import { useAuthApiClient } from '@/lib/useAuthApiClient';
import { Address } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import AddressModal from './AddressModal';

export default function AddressesList() {
  const apiClient = useAuthApiClient();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await apiClient.get<{ addresses: Address[] }>(
        '/account/addresses'
      );
      setAddresses(response.data!.addresses);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load addresses',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await apiClient.delete(`/account/addresses/${id}`);
      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'danger',
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingAddress(null);
    loadAddresses();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Button onClick={handleAddNew}>Add New Address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No addresses saved yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      address.type === 'shipping' ? 'default' : 'outline'
                    }
                  >
                    {address.type}
                  </Badge>
                  {address.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-900">
                <p className="font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p className="mt-1">{address.address1}</p>
                {address.address2 && <p>{address.address2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddressModal address={editingAddress} onClose={handleModalClose} />
      )}
    </>
  );
}
