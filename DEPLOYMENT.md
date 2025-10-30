# Deployment Checklist untuk Vercel

## ✅ Persiapan Sebelum Deploy

- [ ] Pastikan semua dependencies sudah ter-install (`npm install`)
- [ ] Test build lokal (`npm run build`)
- [ ] Test preview build (`npm run preview`)
- [ ] Commit semua perubahan ke Git
- [ ] Push ke GitHub repository

## ✅ Konfigurasi Environment

- [ ] Siapkan Gemini API Key
- [ ] Set environment variable `GEMINI_API_KEY` di Vercel dashboard

## ✅ Deployment Steps

1. **GitHub Repository**:
   - Repository sudah ter-push ke GitHub
   - Branch `main` terbaru

2. **Vercel Setup**:
   - Connect GitHub account ke Vercel
   - Import repository `khutbah-jumat`
   - Vercel akan auto-detect sebagai Vite project

3. **Environment Variables di Vercel**:
   - `GEMINI_API_KEY` = your_actual_api_key

4. **Deploy**:
   - Klik Deploy
   - Tunggu build selesai
   - Akses di URL yang diberikan

## ✅ Post-Deploy Verification

- [ ] Website dapat diakses
- [ ] Fungsi AI/Gemini bekerja dengan baik
- [ ] Tidak ada error di browser console
- [ ] Testing di berbagai device/browser

## 🔧 Troubleshooting

### Build Error:
- Check TypeScript errors: `npm run lint`
- Check dependencies: `npm install`

### Runtime Error:
- Check environment variables di Vercel dashboard
- Check browser console untuk error details
- Check Vercel function logs

### API Error:
- Pastikan GEMINI_API_KEY valid
- Check API quota/limits
- Check network/CORS issues

## 📝 Notes

- Auto-deploy: Setiap push ke `main` akan trigger deployment baru
- Preview: PR akan generate preview URL
- Rollback: Bisa rollback ke deployment sebelumnya via Vercel dashboard