'use client';

import { GroupMap } from '@/components/map/GroupMap';
import { MemberLocation } from '@/hooks/useMapData';

// Mock data for demonstration
const mockMembers: MemberLocation[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    address: '123 Main St, New York, NY',
    latitude: 40.7128,
    longitude: -74.006,
    contributions: 1500,
  },
  {
    id: '2',
    name: 'Bob Smith',
    address: '456 Oak Ave, Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    contributions: 2000,
  },
  {
    id: '3',
    name: 'Carol White',
    address: '789 Pine Rd, Chicago, IL',
    latitude: 41.8781,
    longitude: -87.6298,
    contributions: 1800,
  },
  {
    id: '4',
    name: 'David Brown',
    address: '321 Elm St, Houston, TX',
    latitude: 29.7604,
    longitude: -95.3698,
    contributions: 1200,
  },
];

export default function MapPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Group Map View</h1>
        <GroupMap members={mockMembers} groupName="Savings Group Alpha" />
      </div>
    </div>
  );
}
