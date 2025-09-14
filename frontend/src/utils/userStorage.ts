// User-specific data storage utility
// Ensures each user has completely separate data

export const getUserStorageKey = (userId: string, dataType: string): string => {
  return `trackflow_${userId}_${dataType}`;
};

export const getUserData = (userId: string, dataType: string): any[] => {
  const key = getUserStorageKey(userId, dataType);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const setUserData = (userId: string, dataType: string, data: any[]): void => {
  const key = getUserStorageKey(userId, dataType);
  localStorage.setItem(key, JSON.stringify(data));
};

export const addUserData = (userId: string, dataType: string, newItem: any): any => {
  const existingData = getUserData(userId, dataType);
  const itemWithId = {
    ...newItem,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString()
  };
  const updatedData = [...existingData, itemWithId];
  setUserData(userId, dataType, updatedData);
  return itemWithId;
};

export const updateUserData = (userId: string, dataType: string, itemId: string, updates: any): any => {
  const existingData = getUserData(userId, dataType);
  const updatedData = existingData.map(item => 
    item.id === itemId ? { ...item, ...updates } : item
  );
  setUserData(userId, dataType, updatedData);
  return updatedData.find(item => item.id === itemId);
};

export const deleteUserData = (userId: string, dataType: string, itemId: string): void => {
  const existingData = getUserData(userId, dataType);
  const updatedData = existingData.filter(item => item.id !== itemId);
  setUserData(userId, dataType, updatedData);
};

export const clearUserData = (userId: string): void => {
  // Clear all data for a specific user
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(`trackflow_${userId}_`)) {
      localStorage.removeItem(key);
    }
  });
};
