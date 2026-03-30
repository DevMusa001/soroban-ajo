import { useState, useCallback } from 'react';

export interface MemberLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contributions: number;
}

export interface MapData {
  groupName: string;
  center: { lat: number; lng: number };
  members: MemberLocation[];
  zoom: number;
}

export function useMapData(members: MemberLocation[] = []) {
  const [selectedMember, setSelectedMember] = useState<MemberLocation | null>(null);
  const [zoom, setZoom] = useState(10);

  const calculateCenter = useCallback(() => {
    if (members.length === 0) {
      return { lat: 0, lng: 0 };
    }
    const avgLat = members.reduce((sum, m) => sum + m.latitude, 0) / members.length;
    const avgLng = members.reduce((sum, m) => sum + m.longitude, 0) / members.length;
    return { lat: avgLat, lng: avgLng };
  }, [members]);

  const getMapData = useCallback((): MapData => {
    return {
      groupName: 'Group Members',
      center: calculateCenter(),
      members,
      zoom,
    };
  }, [members, zoom, calculateCenter]);

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(1, Math.min(20, prev + delta)));
  }, []);

  return {
    mapData: getMapData(),
    selectedMember,
    setSelectedMember,
    zoom,
    handleZoom,
  };
}
