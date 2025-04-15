import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Button, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { MarkerType, ImageType } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';

interface MarkerDetailScreenProps {
  fetchedMarker: MarkerType;
}

const MarkerDetailScreen: React.FC<MarkerDetailScreenProps> = ({ fetchedMarker }) => {
  const router = useRouter();
  const { addImage, deleteMarker, getMarkerImages, deleteImage } = useDatabase();
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const data = await getMarkerImages(fetchedMarker.id); // Получаем изображения из базы данных
      setImages(data.map((img) => ({ id: img.id, uri: img.uri, markerId: img.markerId })));
    };
    loadImages();
  }, [fetchedMarker]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;
      const newImageId = await addImage(fetchedMarker.id, newImageUri);
      console.log('Id фото - ', newImageId)
      setImages([...images, { id: newImageId, uri: newImageUri, markerId: fetchedMarker.id }]);
    }
  };

  const handleDeleteMarker = () => {
    Alert.alert(
      'Удалить маркер',
      'Вы уверены, что хотите удалить этот маркер?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          onPress: () => {
            Alert.alert(
              'Удаление изображений',
              'Все изображения, связанные с этим маркером, также будут удалены. Продолжить?',
              [
                {
                  text: 'Отмена',
                  style: 'cancel',
                },
                {
                  text: 'Удалить',
                  onPress: async () => {
                    try {
                      await deleteMarker(fetchedMarker.id);
                      router.back();
                    } catch (error) {
                      console.error('Ошибка при удалении маркера:', error);
                      Alert.alert('Ошибка', 'Не удалось удалить маркер.');
                    }
                  },
                },
              ],
              { cancelable: false }
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteImage = (imageId: number) => {
    setSelectedImage(imageId);
    Alert.alert(
      'Удалить фото',
      'Вы уверены, что хотите удалить это фото?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
          onPress: () => setSelectedImage(null),
        },
        {
          text: 'Удалить',
          onPress: async () => {
            await deleteImage(imageId);
            const newImages = images.filter((img) => img.id !== imageId);
            setImages(newImages);
            setSelectedImage(null);
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.p}>
        Координаты:{"\n"}
        {fetchedMarker.latitude}, {fetchedMarker.longitude}
      </Text>
      <Text style={styles.p}>
        {images.length === 0 ? 'Пока нет фото' : 'Фотографии на этом маркере'}
      </Text>
      <ScrollView>
        {images.map((image) => (
          <TouchableOpacity
            key={image.id}
            style={[
              styles.imageWrapper,
              selectedImage === image.id && styles.selectedImageWrapper,
            ]}
            onPress={() => setSelectedImage(image.id)}
          >
            <Image source={{ uri: image.uri }} style={styles.image} />
            <Button
              title="Удалить"
              onPress={() => handleDeleteImage(image.id)}
              color="red"
              style={styles.deleteButton}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button title="Добавить изображение" onPress={pickImage} />
      <Button title="Удалить маркер" onPress={handleDeleteMarker} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  p: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  imageWrapper: {
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 5,
  },
  selectedImageWrapper: {
    borderColor: 'blue',
  },
  deleteButton: {
    marginTop: 10,
  },
});

export default MarkerDetailScreen;