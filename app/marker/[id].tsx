import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MarkerType } from '../../types'; 
import MarkerDetailScreen from '../../components/MarkerDetailScreen';
import { useDatabase } from '../../contexts/DatabaseContext';

const MarkerPage: React.FC = () => {
  const { id } = useLocalSearchParams();
  const markerId = Array.isArray(id) ? id[0] : id;
  const { getMarkerById } = useDatabase();
  const [fetchedMarker, setFetchedMarker] = useState<MarkerType | null>(null);

  useEffect(() => {
    const loadMarker = async () => {
      if (markerId) {
        const marker = await getMarkerById(Number(markerId));
        setFetchedMarker(marker);
      }
    };
    loadMarker();
  }, [markerId]);

  if (!fetchedMarker) {
    return <Text>Маркер не найден</Text>;
  } else {
    return <MarkerDetailScreen fetchedMarker={fetchedMarker} />
  }
};

export default MarkerPage;