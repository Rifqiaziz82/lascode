// src/lib/userService.ts
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Cari user berdasarkan nama (awalan)
export async function searchUsers(queryString: string) {
  if (!queryString.trim()) return [];

  const q = query(
    collection(db, 'users'),
    where('name', '>=', queryString),
    where('name', '<=', queryString + '\uf8ff')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || 'User Tanpa Nama',
      email: data.email || '',
    };
  });
}

// Ambil data 1 user
export async function getUserById(uid: string) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || 'User Tanpa Nama',
      email: data.email || '',
      bio: data.bio || undefined,
    };
  }
  return null;
}