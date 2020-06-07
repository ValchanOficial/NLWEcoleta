import React, { useState, useEffect } from 'react';
import { AppLoading } from 'expo';
import { Feather as Icon } from '@expo/vector-icons';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import { 
  StyleSheet, 
  View, 
  ImageBackground, 
  Image, 
  Text,
  Picker
} from 'react-native';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const Home = () => {
  const [uf, setUF] = useState('');
  const [city, setCity] = useState('');

  const [initials, setInitials] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [selectedUF, setselectedUF] = useState('Selecione uma UF');
  const [selectedCity, setSelectedCity] = useState('Selecione uma cidade');

  const navigation = useNavigation();

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
      .then(res => {
      const ufInitials = res.data.map(uf => uf.sigla).sort();
      setInitials(ufInitials);
    });
  }, []);

  useEffect(() => {
    if(selectedUF === 'Selecione uma UF') {
      return;
    }
    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
      .then(res => {
      const cityNames = res.data.map(city => city.nome).sort();
      setCities(cityNames);
    });    
  }, [selectedUF]);

  const handleNavigateToPoints = () => navigation.navigate('Points', { uf, city });

  const [fontsLoaded] = useFonts({
    Ubuntu_700Bold,
    Roboto_400Regular,
    Roboto_500Medium
  });

  if (!fontsLoaded) {
    return <AppLoading/>
  }

  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ height:368, width: 274 }}
    >
      <View style={styles.main}>
        <View>
          <Image source={require('../../assets/logo.png')}/>
          <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
          <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
        </View>
      </View>

      <View style={styles.footer}>

        <Text style={styles.description}>Selecione uma UF</Text>
          <Picker
            selectedValue={selectedUF}
            enabled={initials !== []}
            style={styles.input}
            onValueChange={(itemValue, itemIndex) => {setselectedUF(itemValue); setUF(itemValue)}}
          >
            {initials && initials.map((uf, index) => (
              <Picker.Item key={index} label={uf} value={uf} />
            ))}
          </Picker>

        <Text style={styles.description}>Selecione uma cidade</Text>
        {selectedUF && (
          <Picker
            selectedValue={selectedCity}
            enabled={selectedUF !== ''}
            style={styles.input}
            onValueChange={(itemValue, itemIndex) =>{ setSelectedCity(itemValue); setCity(itemValue)}}
          >
            {cities && cities.map((city, index) => (
              <Picker.Item key={index} label={city} value={city} />
            ))}
          </Picker>
        )}

        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#fff" size={24}/>
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home;
