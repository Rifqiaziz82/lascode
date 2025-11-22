// src/lib/userService.ts
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Cari user berdasarkan nama atau email
export async function searchUsers(queryString: string) {
  if (!queryString.trim()) return [];

  const q = query(
    collection(db, 'users'),
    where('name', '>=', queryString),
    where('name', '<=', queryString + '\uf8ff')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as { id: string; name: string; email: string }[];
}

// Ambil data 1 user
export async function getUserById(uid: string) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as { id: string; name: string; email: string; bio?: string };
  }
  return null;
}