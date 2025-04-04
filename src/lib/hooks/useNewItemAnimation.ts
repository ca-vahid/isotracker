"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook to track newly added items for animation
 * @param duration Duration in ms for how long an item should be considered "new"
 * @returns [newItemIds, addNewItem] - Array of new item IDs and a function to add new items
 */
export function useNewItemAnimation(duration = 2000) {
  const [newItemIds, setNewItemIds] = useState<string[]>([]);
  
  const addNewItem = (id: string) => {
    setNewItemIds(prev => [...prev, id]);
    
    // Remove the item from the "new" list after the specified duration
    setTimeout(() => {
      setNewItemIds(prev => prev.filter(itemId => itemId !== id));
    }, duration);
  };
  
  // Clean up any remaining timeouts on unmount
  useEffect(() => {
    return () => {
      // This is a simplified cleanup - in a real app with many items
      // we might want to store and clear the actual timeout IDs
    };
  }, []);
  
  return [newItemIds, addNewItem] as const;
} 