import { SafeAreaView, StyleSheet, View, Dimensions, Alert, Text, TouchableOpacity, Animated, Linking, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useState, useEffect, useRef } from 'react';
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

// Helper function to normalize a single location string
const normalizeLocation = (location: string): string => {
  // Remove capacity info like "[cap.60]"
  let normalized = location.replace(/\s*\[cap\.\d+\]\s*$/, '');
  // Remove trailing (HTS) that appears AFTER the main identifier like (R/HTS), (SSEN ITS), (HCS)
  // But keep the main identifiers themselves
  normalized = normalized.replace(/\s*\(HTS\)\s*$/, '');
  return normalized.trim();
};

// Function to find the first valid location from a potentially comma-separated string
const findFirstValidLocation = (locationString: string): { latitude: number; longitude: number } | null => {
  // Split by comma in case there are multiple locations
  const locations = locationString.split(',').map(loc => loc.trim());
  
  // Try each location until we find a match
  for (const loc of locations) {
    const normalized = normalizeLocation(loc);
    if (campusLocations[normalized]) {
      return campusLocations[normalized];
    }
  }
  
  return null;
};

export default function MapScreen() {
  const timetable = useTimetableStore((state) => state.timetable);
  const [hasTimetable, setHasTimetable] = useState(false);

  // Check if timetable has been fetched
  useEffect(() => {
    if (timetable && timetable.length > 0) {
      setHasTimetable(true);
    }
  }, [timetable]);

  // Filter events that have a known location
  const eventsWithLocation = timetable.filter((e) => {
    if (!e.location) return false;
    return findFirstValidLocation(e.location) !== null;
  });

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // DEMO PINS - Always show these two locations after timetable is fetched
  const demoPins = [
    {
      id: 'demo-carnelley',
      title: 'Carnelley Small LT (HTS)',
      description: 'Lecture Theater',
      coordinates: campusLocations['Carnelley Small LT (HTS)']
    },
    {
      id: 'demo-fulton', 
      title: 'Fulton F20 (HTS)',
      description: 'Classroom',
      coordinates: campusLocations['Fulton F20 (HTS)']
    }
  ];

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

  // Compute the next event for the next 24 hours
  useEffect(() => {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingEvents = eventsWithLocation
      .map(e => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime)
      }))
      .filter((e) => {
        return e.startTime >= now && e.startTime <= next24Hours;
      })
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    if (upcomingEvents.length > 0) {
      const event = upcomingEvents[0];
      setNextEvent(event);
      const coords = findFirstValidLocation(event.location);
      if (coords) {
        setDestination(coords);
      }
    } else {
      setNextEvent(null);
      setDestination(null);
      setIsNavigating(false);
    }
  }, [timetable]);

  // Animate card slide
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isCardExpanded ? 0 : 120,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCardExpanded]);

  // Update user location continuously when navigating
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    if (isNavigating && destination) {
      (async () => {
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (location) => {
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        );
      })();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isNavigating, destination]);

  const handleGetDirections = () => {
    if (!destination || !userLocation) {
      Alert.alert('Unable to navigate', 'Location or destination not available.');
      return;
    }

    setIsNavigating(true);
    
    // Fit map to show both user location and destination
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([userLocation, destination], {
        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
  };

  const openInGoogleMaps = () => {
    if (!destination || !userLocation) {
      Alert.alert('Unable to open maps', 'Location or destination not available.');
      return;
    }

    const url = Platform.select({
      ios: `maps://app?daddr=${destination.latitude},${destination.longitude}&dirflg=w`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}&mode=w`
    });

    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=walking`;

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Linking.openURL(fallbackUrl);
      }
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.nextEventCard,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <TouchableOpacity 
          onPress={() => setIsCardExpanded(!isCardExpanded)}
          style={styles.cardHeader}
          activeOpacity={0.7}
        >
          <View style={styles.toggleBar} />
          <Text style={styles.toggleIndicator}>{isCardExpanded ? '▼' : '▲'}</Text>
        </TouchableOpacity>

        {isCardExpanded && (
          <>
            {nextEvent ? (
              <>
                <Text style={styles.nextEventTitle}>Next Class in 24hrs:</Text>
                <Text style={styles.eventName}>{nextEvent.title}</Text>
                <Text style={styles.eventLocation}>{nextEvent.location}</Text>
                <Text style={styles.eventTime}>
                  {formatTime(nextEvent.startTime)} - {formatTime(nextEvent.endTime)}
                </Text>
                
                {!isNavigating ? (
                  <>
                    <TouchableOpacity 
                      style={styles.directionsButton}
                      onPress={handleGetDirections}
                    >
                      <Text style={styles.directionsButtonText}>🧭 Get Directions</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.googleMapsButton}
                      onPress={openInGoogleMaps}
                    >
                      <Text style={styles.googleMapsButtonText}>📍 Open in Maps</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.stopButton}
                      onPress={handleStopNavigation}
                    >
                      <Text style={styles.stopButtonText}>⏹ Stop Navigation</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.googleMapsButton}
                      onPress={openInGoogleMaps}
                    >
                      <Text style={styles.googleMapsButtonText}>📍 Open in Maps</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <View style={styles.noClassContainer}>
                <Text style={styles.noClassEmoji}>📅</Text>
                <Text style={styles.noClassText}>No classes scheduled</Text>
                <Text style={styles.noClassSubtext}>in the next 24 hours</Text>
              </View>
            )}
          </>
        )}
      </Animated.View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 56.4585,
          longitude: -2.981,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }}
        showsUserLocation={true}
      >
        {/* Show demo pins ONLY after timetable has been fetched */}
        {hasTimetable && demoPins.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={pin.coordinates}
            title={pin.title}
            description={pin.description}
            onPress={() => setDestination(pin.coordinates)}
          />
        ))}

        {/* Show actual timetable events */}
        {eventsWithLocation.map((event, index) => {
          const coords = findFirstValidLocation(event.location);
          if (!coords) return null;
          return (
            <Marker
              key={`${event.moduleCode}-${event.title}-${index}`}
              coordinate={coords}
              title={event.title}
              description={event.location}
              onPress={() => setDestination(coords)}
            />
          );
        })}

        {userLocation && destination && isNavigating && (
          <Polyline
            coordinates={[userLocation, destination]}
            strokeColor="#4365E2"
            strokeWidth={4}
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
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    zIndex: 10,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  toggleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    marginBottom: 8,
  },
  toggleIndicator: {
    fontSize: 18,
    color: '#4365E2',
    fontWeight: 'bold',
  },
  nextEventTitle: { fontSize: 14, color: '#808080', marginBottom: 4 },
  eventName: { fontSize: 16, fontWeight: 'bold', color: '#4365E2' },
  eventLocation: { fontSize: 14, color: '#333', marginTop: 2 },
  eventTime: { fontSize: 14, color: '#555', marginTop: 2 },
  directionsButton: {
    marginTop: 12,
    backgroundColor: '#4365E2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    marginTop: 12,
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleMapsButton: {
    marginTop: 8,
    backgroundColor: '#34A853',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleMapsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noClassContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  noClassEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  noClassText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noClassSubtext: {
    fontSize: 14,
    color: '#808080',
    marginTop: 2,
  },
});