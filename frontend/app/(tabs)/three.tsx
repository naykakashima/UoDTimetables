import { SafeAreaView, StyleSheet, View, Dimensions, Alert, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useTimetableStore } from '@/utils/timetableStore';

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

// Helper function to normalize location strings
// Removes capacity info like "[cap.161]" from location strings
const normalizeLocation = (location: string): string => {
  return location.replace(/\s*\[cap\.\d+\]\s*$/, '').trim();
};

export default function MapScreen() {
  const timetable = useTimetableStore((state) => state.timetable);

  // Filter events that have a known location
  const eventsWithLocation = timetable.filter((e) => {
    if (!e.location) return false;
    const normalized = normalizeLocation(e.location);
    return campusLocations[normalized] !== undefined;
  });

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);

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

  // Compute the next event for today
  useEffect(() => {
    const now = new Date();
    const todayEvents = eventsWithLocation.filter((e) => {
      const start = new Date(e.startTime);
      return start >= now && start.toDateString() === now.toDateString();
    });
    if (todayEvents.length > 0) {
      todayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      const event = todayEvents[0];
      setNextEvent(event);
      const normalized = normalizeLocation(event.location);
      setDestination(campusLocations[normalized]);
    }
  }, [timetable, eventsWithLocation]);

  return (
    <SafeAreaView style={styles.container}>
      {nextEvent && (
        <View style={styles.nextEventCard}>
          <Text style={styles.nextEventTitle}>Next Event:</Text>
          <Text style={styles.eventName}>{nextEvent.title}</Text>
          <Text style={styles.eventLocation}>{nextEvent.location}</Text>
          <Text style={styles.eventTime}>
            {new Date(nextEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
            {new Date(nextEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}

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
        {eventsWithLocation.map((event, index) => {
          const normalized = normalizeLocation(event.location);
          const loc = campusLocations[normalized];
          if (!loc) return null;
          return (
            <Marker
              key={`${event.moduleCode}-${event.title}-${index}`}
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
  nextEventCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 10,
  },
  nextEventTitle: { fontSize: 14, color: '#808080', marginBottom: 4 },
  eventName: { fontSize: 16, fontWeight: 'bold', color: '#4365E2' },
  eventLocation: { fontSize: 14, color: '#333', marginTop: 2 },
  eventTime: { fontSize: 14, color: '#555', marginTop: 2 },
});