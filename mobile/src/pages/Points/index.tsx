import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import {
  View, 
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';

import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

interface Params {
  uf: string;
  city: string;
}

const Points = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);

  const navigation = useNavigation();

  const route = useRoute();
  const routeParams = route.params as Params;

  useEffect(() => {
    const loadPosition = async () => {
      const { status } = await Location.requestPermissionsAsync();
      if(status !== 'granted'){
        Alert.alert('Oooops...', 'Precisamos de sua permisão para obter a localização');
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;
      setInitialPosition([latitude, longitude]);
    }
    loadPosition();
  }, []);

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    api.get('points', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItems
      }
    }).then(res => {
      setPoints(res.data);
    })
  }, [selectedItems]);

  const handleNavigateBack = () => navigation.navigate('Home');
  const handleNavigateToDetail = (id: number) => { navigation.navigate('Detail', { point_id: id })};

  const handleSelectItem = (id: number) => {
    const alreadySelected = selectedItems.findIndex(item => item === id);
    if(alreadySelected >= 0) {
      setSelectedItems(selectedItems.filter(item => item !== id));
      return;
    }
    setSelectedItems([...selectedItems, id]);
  }

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79"/>
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>Encontre um ponto de coleta.</Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 ? (
            <MapView 
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014
              }}
            >
              {points.length !== 0 && points.map(({id, name, image_url, latitude, longitude}) => (
                <Marker
                  key={String(id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(id)}
                  coordinate={{
                    latitude,
                    longitude,
                  }}
                >
                  <View  style={styles.mapMarkerContainer}>
                    <Image
                      style={styles.mapMarkerImage} 
                      source={{ uri: image_url }}
                    />
                    <Text style={styles.mapMarkerTitle}>{name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingTitle}>Carregando..</Text>
              <ActivityIndicator size={50} color="#34cb79"/>
            </View>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {(items.length !== 0 && initialPosition[0] !== 0) && items.map(({id, title, image_url}) => (
            <TouchableOpacity 
              key={String(id)} 
              style={[
                styles.item,
                selectedItems.includes(id) ? styles.selectedItem : {}
              ]} 
              onPress={() => handleSelectItem(id)}
              activeOpacity={0.6}
            >
              <SvgUri width={42} height={42} uri={image_url}/>
              <Text style={styles.itemTitle}>{title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'center'
  },

  loadingContainer: {
    flex: 1, 
    justifyContent:"center", 
    alignItems:"center"
  },

  loadingTitle: {
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginBottom: 24,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points;
