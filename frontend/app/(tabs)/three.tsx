import { SafeAreaView, StyleSheet, View, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';

// Hardcoded classroom coordinates
const campusLocations: { [key: string]: { latitude: number; longitude: number } } = {
  "Carnelley Small LT (HTS)": { latitude: 56.45796681357321, longitude: -2.9787965447026328 },
  "Fulton F20 (HTS)": { latitude: 56.45871224159234, longitude: -2.9807692341635756 },
  "Dalhousie 2S13 (R/HTS)": { latitude: 56.459227940751894, longitude: -2.982197181844532 },
  "Queen Mother Lab 2 (SSEN ITS)": { latitude: 56.458584746610526, longitude: -2.982639746349652 },
  "Queen Mother Lab 1 (SSEN ITS)": { latitude: 56.458584746610526, longitude: -2.982639746349652 },
  "Queen Mother Lab 0 (SSEN ITS)": { latitude: 56.458584746610526, longitude: -2.982639746349652 },
  "Queen Mother Wolfson LT (HCS)": { latitude: 56.458584746610526, longitude: -2.982639746349652 },
};

export default function TabTwoScreen() {
  const { timetable } = useLocalSearchParams<{ timetable: string }>();
  const parsedTimetable = timetable ? JSON.parse(timetable) : [];

  const eventsWithLocation = parsedTimetable.filter(
    (e: any) => e.location && campusLocations[e.location]
  );

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to use the map.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 56.4585,
          longitude: -2.981,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
        showsUserLocation={true}
      >
        {eventsWithLocation.map((event: any) => {
          const loc = campusLocations[event.location];
          if (!loc) return null;
          return (
            <Marker
              key={event.moduleCode + event.title}
              coordinate={loc}
              title={event.title}
              description={event.location}
              onPress={() => setDestination(loc)}
            />
          );
        })}

        {userLocation && destination && (
          <Polyline
            coordinates={[userLocation, destination]}
            strokeColor="#4365E2"
            strokeWidth={3}
          />
        )}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});
