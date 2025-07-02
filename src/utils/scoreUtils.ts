import { ref, set, get } from 'firebase/database';
import { db } from '../firebase/firebase';

export const saveScore = async (userId: string, score: number) => {
  try {
    // Get current user data
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const currentHighScore = userData.highScore || 0;
      
      // Only update if the new score is higher
      if (score > currentHighScore) {
        await set(ref(db, `users/${userId}/highScore`), score);
        console.log(`New high score saved: ${score}`);
        return { isNewHighScore: true, previousHighScore: currentHighScore };
      } else {
        console.log(`Score ${score} is not higher than current high score ${currentHighScore}`);
        return { isNewHighScore: false, currentHighScore };
      }
    } else { 
      console.error('User data not found');
      return { isNewHighScore: false, error: 'User data not found' };
    }
  } catch (error: any) {
    console.error('Error saving score:', error);
    return { isNewHighScore: false, error: error.message };
  }
};

export const getUserHighScore = async (userId: string): Promise<number> => {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.highScore || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting user high score:', error);
    return 0;
  }
}; 