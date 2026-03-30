'use client';

import { MemberLocation } from '@/hooks/useMapData';
import { MapPin, DollarSign } from 'lucide-react';

interface MemberMarkerProps {
  member: MemberLocation;
  isSelected: boolean;
  onClick: () => void;
}

export function MemberMarker({ member, isSelected, onClick }: MemberMarkerProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all ${
        isSelected ? 'scale-125' : 'scale-100 hover:scale-110'
      }`}
    >
      {/* Marker Pin */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg ${
          isSelected ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-blue-500'
        }`}
      >
        <MapPin className="w-4 h-4" />
      </div>

      {/* Tooltip on hover/select */}
      {isSelected && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-3 w-48 z-10">
          <div className="font-semibold text-sm text-gray-900">{member.name}</div>
          <div className="text-xs text-gray-600 mt-1">{member.address}</div>
          <div className="flex items-center gap-1 mt-2 text-green-600 font-medium">
            <DollarSign className="w-3 h-3" />
            <span>{member.contributions.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
