// src/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // 👈 pastikan `db` ada

export const authService = {
  login: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  loginWithGoogle: () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },

  logout: () => {
    return signOut(auth);
  },
  register: async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update displayName di Firebase Auth
    if (displayName) {
      await updateFirebaseProfile(user, { displayName });
    }

    // Simpan ke Firestore
     await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name: displayName || email.split('@')[0],
      bio: '',
      createdAt: new Date().toISOString(),
    });

    return userCredential;
  },

  // Tambahkan fungsi untuk update profile
  updateProfile: async (updates: { name?: string; bio?: string }) => {
    if (!auth.currentUser) throw new Error('Not logged in');
    
    const { uid } = auth.currentUser;
    
    // Update di Auth (opsional)
    if (updates.name) {
      await updateFirebaseProfile(auth.currentUser, { displayName: updates.name });
    }

    const testSave = async () => {
  try {
    await setDoc(doc(db, 'users', 'test123'), {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'Ini user uji coba'
    });
    console.log('Data berhasil disimpan!');
  } catch (err) {
    console.error('Gagal simpan:', err);
  }
};

testSave();

    // Update di Firestore
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
  },
};

