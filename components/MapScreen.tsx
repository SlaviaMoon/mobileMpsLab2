import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect, useRouter } from 'expo-router';
import { MarkerType } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';


const MapScreen: React.FC = () => {
  const router = useRouter();
  const { addMarker, getMarkers } = useDatabase();
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const mapRef = useRef<MapView>(null);

  useFocusEffect(
    React.useCallback(() => {
      const loadMarkers = async () => {
        const data = await getMarkers();
        setMarkers(data);
      };
      loadMarkers();
    }, [])
  );

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const markerId = await addMarker(latitude, longitude);
    setMarkers([...markers, { id: markerId, latitude, longitude, images: [] }]);
  };

  const handleMarkerPress = (marker: MarkerType) => {
    console.log('Нажат маркер:', marker);
    router.push(`/marker/${marker.id}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 58.00758,
          longitude: 56.18743,
          latitudeDelta: 0.005,
          longitudeDelta: 0.02,
        }}
        onLongPress={handleMapPress}
      >
        {
          markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{latitude: marker.latitude, longitude: marker.longitude}}
              onPress={() => handleMarkerPress(marker)}
            >
            </Marker>
          ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 5,
    width: '30%',
    marginRight: 10,
  },
});

export default MapScreen;