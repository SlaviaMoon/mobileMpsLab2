import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '../database/schema';
import { MarkerType, ImageType } from '../types';

interface DatabaseContextType {
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<MarkerType[]>;
  addImage: (markerId: number, uri: string) => Promise<number>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<ImageType[]>;
  getMarkerById: (id: number) => Promise<MarkerType | null>;

  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const db = SQLite.openDatabaseSync('markers.db');

  useEffect(() => {
    initDatabase()
      .then(() => console.log('База данных инициализирована'))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, []);

  const addMarker = async (latitude: number, longitude: number): Promise<number> => {
    setIsLoading(true);
    try {
      const result = await db.runAsync(
        'INSERT INTO markers (latitude, longitude) VALUES (?, ?);',
        [latitude, longitude]
      );
      return result.lastInsertRowId as number;
    } catch (err) {
        console.log(err)
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMarker = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      const check = await db.getAllAsync<ImageType>(
        'SELECT id FROM marker_images WHERE marker_id = ?;',
        [id]
      );
      await db.runAsync('DELETE FROM marker_images WHERE marker_id = ?;', [id]);
      await db.runAsync('DELETE FROM markers WHERE id = ?;', [id]);
      console.log('Маркер и связанные изображения удалены - ', id, check)
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMarkers = async (): Promise<MarkerType[]> => {
    setIsLoading(true);
    try {
      const result = await db.getAllAsync<MarkerType>('SELECT * FROM markers;');
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addImage = async (markerId: number, uri: string): Promise<number> => {
    setIsLoading(true);
    try {
      const result = await db.runAsync(
        'INSERT INTO marker_images (marker_id, uri) VALUES (?, ?);',
        [markerId, uri]
      );
      return result.lastInsertRowId as number;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      await db.runAsync('DELETE FROM marker_images WHERE id = ?;', [id]);
      console.log('delimg - ', id)
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMarkerImages = async (markerId: number): Promise<ImageType[]> => {
    setIsLoading(true);
    try {
      const result = await db.getAllAsync<ImageType>(
        'SELECT * FROM marker_images WHERE marker_id = ?;',
        [markerId]
      );
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getMarkerById = async (id: number): Promise<MarkerType | null> => {
    setIsLoading(true);
    try {
      const results = await db.getAllAsync<MarkerType>(
        'SELECT * FROM markers WHERE id = ?;',
        [id]
      );
      
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  const contextValue: DatabaseContextType = {
    addMarker,
    deleteMarker,
    getMarkers,
    addImage,
    deleteImage,
    getMarkerImages,
    getMarkerById,
    isLoading,
    error,
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};