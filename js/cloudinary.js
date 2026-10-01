// ================================================================

// NOTE: CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET are declared in
// the small inline <script> in index.html (next to the Firebase config) —
// deliberately not redeclared here, since a second `const` with the same
// name would throw ("already been declared") and break this whole file.
// cloudinary.js — file/image upload helper (unsigned preset, client-side
// type/size validation, organised folders). No secret key lives here.
// ================================================================
// Shared safety net (Step 5): every upload path — however many MB limit or
// accept="" hint it already has at the file-picker level — also passes
// through here, so a mislabeled or disguised file (e.g. a renamed .exe)
// can never reach Cloudinary. This backstops the per-form checks; it
// doesn't replace the friendlier, more specific messages some forms show
// before the file ever reaches these functions.
const CLOUDINARY_ALLOWED_EXT = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  auto: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
};
const CLOUDINARY_MAX_BYTES = { image: 10 * 1024 * 1024, auto: 20 * 1024 * 1024 };
function _cloudinaryValidate(file, resourceType) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allowed = CLOUDINARY_ALLOWED_EXT[resourceType] || CLOUDINARY_ALLOWED_EXT.auto;
  if (!allowed.includes(ext)) throw new Error('That file type isn\'t allowed here. Allowed: ' + allowed.join(', ').toUpperCase());
  const max = CLOUDINARY_MAX_BYTES[resourceType] || CLOUDINARY_MAX_BYTES.auto;
  if (file.size > max) throw new Error('File is too large — max ' + Math.round(max / 1024 / 1024) + 'MB.');
}
// Uploads a file to Cloudinary (unsigned preset — no secret key needed in
// the browser) and returns its public URL. Used for every document/photo
// upload so Firestore only ever stores a short URL, never the raw file —
// Firestore documents are capped at 1MB, so storing files directly there
// would fail once a teacher/student attached more than one document.
// `folder` organises uploads in the Cloudinary media library (e.g.
// "althea-scholar/teachers/documents") — purely organisational, not a
// security boundary.
async function uploadToCloudinary(file, resourceType = 'auto', folder = 'althea-scholar/misc') {
  _cloudinaryValidate(file, resourceType);
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  form.append('folder', folder);
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Cloudinary upload failed:', res.status, errText);
    throw new Error('Cloudinary upload failed');
  }
  const data = await res.json();
  return data.secure_url;
}
// Uploads a "view only" document (used for Study Material & Entrance Exam
// resources). PDFs and images are uploaded as Cloudinary "image" assets,
// which lets us request each page as a plain JPG (pg_1, pg_2, ...) instead
// of ever serving the original downloadable file — so there's no PDF/file
// link anywhere for a student to save, only page images shown in a reader.
async function uploadViewOnlyFile(file, folder = 'althea-scholar/resources') {
  const isPdf = /\.pdf$/i.test(file.name);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
  const resourceType = (isPdf || isImage) ? 'image' : 'auto';
  _cloudinaryValidate(file, 'auto'); // 'auto' allow-list covers pdf/doc/docx and images — the right set for a resource upload
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  form.append('folder', folder);
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Cloudinary upload failed:', res.status, errText);
    throw new Error('Cloudinary upload failed');
  }
  const data = await res.json();
  return {
    url: data.secure_url,
    isPdf: isPdf,
    isImage: isImage,
    pages: isPdf ? (data.pages || 1) : 1
  };
}
// Builds the URL for a single PDF page as a plain JPG image.
function cloudinaryPageUrl(secureUrl, pageNum) {
  return secureUrl.replace('/upload/', `/upload/pg_${pageNum}/`).replace(/\.[a-zA-Z0-9]+$/, '.jpg');
}
