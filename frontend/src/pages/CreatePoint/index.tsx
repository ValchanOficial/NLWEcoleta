import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import Dropzone from '../../components/Dropzone';
import api from '../../services/api';

import { ReactComponent as Logo } from '../../assets/logo.svg';
import './CreatePoint.css';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [initials, setInitials] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [seletedFile, setSelectedFile] = useState<File>();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [selectedUF, setselectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(res => {
            setItems(res.data);
        });
    }, []);

    useEffect(() => {
        axios
            .get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/')
            .then(res => {
            const ufInitials = res.data.map(uf => uf.sigla).sort();
            setInitials(ufInitials);
        });  
    }, []);

    useEffect(() => {
        if(selectedUF === '0') {
            setselectedUF('');
            return;
        }
        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
            .then(res => {
            const cityNames = res.data.map(city => city.nome).sort();
            setCities(cityNames);
        });
    }, [selectedUF]);

    const handleSelectUF = (event: ChangeEvent<HTMLSelectElement>) => {
        setselectedUF(event.target.value);
    }

    const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(event.target.value);
    }

    const handleMapClick = (event: LeafletMouseEvent) => {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSelectItem = (id: number) => {
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected >= 0) {
            setSelectedItems(selectedItems.filter(item => item !== id));
            return;
        }
        setSelectedItems([...selectedItems, id]);
    }
    
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();
        data.append('name',name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if (seletedFile) {
            data.append('image', seletedFile);
        }

        await api.post('points', data);
        alert('Ponto de coleta criado!');
        history.push('/');
    }

    return(
        <div id="page-create-point">
            <header>
                <Logo title="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map 
                        center={initialPosition} 
                        zoom={12}
                        onClick={handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUF} 
                                onChange={handleSelectUF}
                            >
                                <option value="0">Selecione uma UF</option>
                                {initials && initials.map((uf) => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities && cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de coleta</h2>
                        <span>Selecione um ou mais items abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items && items.map(({id, title, image_url}) => (
                            <li 
                                key={id} 
                                onClick={() => handleSelectItem(id)}
                                className={selectedItems.includes(id) ? 'selected' : ''}
                            >
                                <img src={image_url} alt={title}/>
                                <span>{title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;
