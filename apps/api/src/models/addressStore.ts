import { Address } from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';

class AddressStore {
  private addresses: Map<string, Address> = new Map();
  private userAddressIndex: Map<string, Set<string>> = new Map();

  async getUserAddresses(userId: string): Promise<Address[]> {
    const addressIds = this.userAddressIndex.get(userId) || new Set();
    return Array.from(addressIds)
      .map((id) => this.addresses.get(id))
      .filter((addr): addr is Address => addr !== undefined)
      .sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }

  async getAddressById(
    id: string,
    userId: string
  ): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address || address.userId !== userId) return undefined;
    return address;
  }

  async createAddress(
    userId: string,
    addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Address> {
    const now = new Date().toISOString();
    const id = uuidv4();

    if (addressData.isDefault) {
      await this.clearDefaultForType(userId, addressData.type);
    }

    const address: Address = {
      ...addressData,
      id,
      userId,
      createdAt: now,
      updatedAt: now,
    };

    this.addresses.set(id, address);

    const userAddresses = this.userAddressIndex.get(userId) || new Set();
    userAddresses.add(id);
    this.userAddressIndex.set(userId, userAddresses);

    return address;
  }

  async updateAddress(
    id: string,
    userId: string,
    updates: Partial<Omit<Address, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address || address.userId !== userId) return undefined;

    if (updates.isDefault && updates.isDefault !== address.isDefault) {
      await this.clearDefaultForType(userId, address.type);
    }

    const updatedAddress = {
      ...address,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const address = this.addresses.get(id);
    if (!address || address.userId !== userId) return false;

    this.addresses.delete(id);

    const userAddresses = this.userAddressIndex.get(userId);
    if (userAddresses) {
      userAddresses.delete(id);
    }

    return true;
  }

  async getDefaultAddress(
    userId: string,
    type: 'shipping' | 'billing'
  ): Promise<Address | undefined> {
    const addresses = await this.getUserAddresses(userId);
    return addresses.find((addr) => addr.type === type && addr.isDefault);
  }

  private async clearDefaultForType(
    userId: string,
    type: 'shipping' | 'billing'
  ): Promise<void> {
    const addresses = await this.getUserAddresses(userId);
    addresses.forEach((addr) => {
      if (addr.type === type && addr.isDefault) {
        this.addresses.set(addr.id, {
          ...addr,
          isDefault: false,
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }
}

export const addressStore = new AddressStore();
