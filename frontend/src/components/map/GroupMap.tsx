'use client';

import { useState } from 'react';
import { useMapData, MemberLocation } from '@/hooks/useMapData';
import { MemberMarker } from './MemberMarker';
import { ZoomIn, ZoomOut, MapPin } from 'lucide-react';

interface GroupMapProps {
  members: MemberLocation[];
  groupName?: string;
}

export function GroupMap({ members, groupName = 'Group Members' }: GroupMapProps) {
  const { mapData, selectedMember, setSelectedMember, handleZoom } = useMapData(members);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  if (members.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No member locations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{groupName} - Geographic Distribution</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleZoom(1)}
            className="p-2 border rounded-lg hover:bg-gray-100"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="p-2 border rounded-lg hover:bg-gray-100"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full border-t border-gray-300"
              style={{ top: `${(i + 1) * 10}%` }}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full border-l border-gray-300"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Members */}
        <div className="absolute inset-0">
          {members.map((member) => {
            const x = ((member.longitude + 180) / 360) * 100;
            const y = ((90 - member.latitude) / 180) * 100;

            return (
              <div
                key={member.id}
                className="absolute"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <MemberMarker
                  member={member}
                  isSelected={selectedMember?.id === member.id || hoveredMember === member.id}
                  onClick={() => setSelectedMember(member)}
                />
              </div>
            );
          })}
        </div>

        {/* Center Indicator */}
        <div
          className="absolute w-2 h-2 bg-red-500 rounded-full"
          style={{
            left: `${((mapData.center.lng + 180) / 360) * 100}%`,
            top: `${((90 - mapData.center.lat) / 180) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
          title="Group center"
        />
      </div>

      {/* Member Details */}
      {selectedMember && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-lg mb-2">{selectedMember.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Address</div>
              <div className="font-medium">{selectedMember.address}</div>
            </div>
            <div>
              <div className="text-gray-600">Coordinates</div>
              <div className="font-medium">
                {selectedMember.latitude.toFixed(4)}, {selectedMember.longitude.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Total Contributions</div>
              <div className="font-medium text-green-600">${selectedMember.contributions.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Members ({members.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`p-2 rounded text-left text-sm transition-colors ${
                selectedMember?.id === member.id
                  ? 'bg-blue-200 text-blue-900'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{member.name}</div>
              <div className="text-xs text-gray-600">${member.contributions.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
