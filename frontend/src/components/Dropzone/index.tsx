import React, { useCallback, useState } from 'react';
import {useDropzone} from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

import './style.css';

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }: Props) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        setSelectedFileUrl(URL.createObjectURL(file));
        onFileUploaded(file);
    }, [onFileUploaded]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*'
    });

    return (
        <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} accept="image/*" />
            {
                selectedFileUrl
                ? <img src={selectedFileUrl} alt="Point thumbnail"/>
                : (<p><FiUpload size={24}/> Adicione a imagem do estabelecimento...</p>)
            }
        </div>
    );
}

export default Dropzone;
