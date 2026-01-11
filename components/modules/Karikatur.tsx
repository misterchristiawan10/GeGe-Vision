import React from 'react';
import { GeneratorModule } from '../GeneratorModule';

interface KarikaturModuleProps {
    initialState?: any;
    onStateChange?: (state: any) => void;
}

export const KarikaturModule: React.FC<KarikaturModuleProps> = ({ initialState, onStateChange }) => {
  return (
    <GeneratorModule 
      moduleId="karikatur"
      title="Gege Karikatur"
      description="Bikin fotomu jadi karikatur lucu dan artistik dalam sekejap. Seru buat profil atau hadiah!"
      promptPrefix="Gambar karikatur artistik berkualitas tinggi yang lucu dan penuh warna dari orang ini, fitur yang dilebih-lebihkan, gaya ekspresif, detail bayangan,"
      requireImage={true}
      defaultAspectRatio="3:4"
      initialState={initialState}
      onStateChange={onStateChange}
    />
  );
};
