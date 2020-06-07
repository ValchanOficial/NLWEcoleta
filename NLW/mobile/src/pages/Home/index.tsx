import React, { useState } from 'react';
import { AppLoading } from 'expo';
import { Feather as Icon } from '@expo/vector-icons';
import { Ubuntu_700Bold, useFonts } from '@expo-google-fonts/ubuntu';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from "@react-navigation/native";
import { 
  StyleSheet, 
  View, 
  ImageBackground, 
  Image, 
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const Home = () => {
  const [uf, setUF] = useState('');
  const [city, setCity] = useState('');
  const navigation = useNavigation();

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
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding': 'padding'}
    >
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
          <TextInput 
            style={styles.input} 
            placeholder="Selecione a UF" 
            value={uf}
            maxLength={2}
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={setUF}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Selecione a Cidade"
            value={city}
            autoCorrect={false}
            onChangeText={setCity}
          />

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
    </KeyboardAvoidingView>  
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
