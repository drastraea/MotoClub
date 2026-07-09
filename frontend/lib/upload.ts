// Turn a picked image file into the URL the backend stores on the record.
//
// ponytail: there is no dedicated upload service yet, so the file is inlined as
// a base64 data URI client-side and returned as the "URL". When the real upload
// endpoint lands, swap the body to POST the file and return its hosted URL —
// every caller already just stores the returned string, so nothing else changes.
export function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
