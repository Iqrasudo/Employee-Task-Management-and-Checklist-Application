import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { FileKind } from '../types/task';

export type PickedFile = { name: string; kind: FileKind; sizeKb: number; uri: string };

export const MAX_FILE_MB = 20;
const ALLOWED = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'heic', 'webp'];

export class FilePickError extends Error {}

export function kindFromName(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'heic', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  return 'other';
}

export function formatSize(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

// The backend checks this again; the app checks first so the user hears about it straight away.
function check(name: string, sizeBytes?: number | null) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED.includes(ext)) throw new FilePickError('This file type is not allowed. Use PDF, Word, Excel or a photo.');
  if (sizeBytes && sizeBytes > MAX_FILE_MB * 1024 * 1024) throw new FilePickError(`This file is larger than ${MAX_FILE_MB} MB.`);
}

export async function takePhoto(): Promise<PickedFile | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new FilePickError('Allow camera access in your phone settings to take a photo.');
  const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
  if (result.canceled) return null;
  const a = result.assets[0];
  const name = a.fileName ?? `photo-${Date.now()}.jpg`;
  check(name.includes('.') ? name : `${name}.jpg`, a.fileSize);
  return { name, kind: 'image', sizeKb: Math.round((a.fileSize ?? 0) / 1024), uri: a.uri };
}

export async function pickFromGallery(): Promise<PickedFile | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled) return null;
  const a = result.assets[0];
  const name = a.fileName ?? `image-${Date.now()}.jpg`;
  check(name.includes('.') ? name : `${name}.jpg`, a.fileSize);
  return { name, kind: 'image', sizeKb: Math.round((a.fileSize ?? 0) / 1024), uri: a.uri };
}

export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const a = result.assets[0];
  check(a.name, a.size);
  return { name: a.name, kind: kindFromName(a.name), sizeKb: Math.round((a.size ?? 0) / 1024), uri: a.uri };
}
